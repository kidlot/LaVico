var util = require("./util.js") ;

module.exports = {

    layout: "welab/Layout"
    , view: "welab/templates/summary/userActive.html"

    , process: function (seed, nut) {

    }
    , children: {

        page: {

            layout: null
            , view: "lavico/templates/summary/userActivePage.html"

            , process: function (seed, nut) {
                var then=this;

                // 图

                var count = util.countor(this) ;
                count("messages","totalMessages",{replyFor:{$exists:false}}) ;

                var countGroup = util.countGroup(this) ;
                countGroup("messages","first10Total","$from",{replyFor:{$exists:false}},false,10) ;


                // 未绘画
                var _user = [];
                helper.db.coll("welab/customers").find({}).toArray(this.hold(function(err,doc){

                    for( var ii=0 ; ii < doc.length ; ii++){
                        if( doc[ii].lastMessageTime){
                            var day = (new Date().getTime() - doc[ii].lastMessageTime) / (1000*60*60*24)
                            _user.push({_id:doc[ii]._id, day: day})
                        }
                    }
                }))

                this.step(function(){

                    var _list = [];
                    _list.push({n:[0,3],title:"3天以内", sum:0})
                    _list.push({n:[3,10],title:"10天以内", sum:0})
                    _list.push({n:[10,15],title:"15天以内", sum:0})
                    _list.push({n:[15,30],title:"30天以内", sum:0})
                    _list.push({n:[30,3650],title:"30天以上", sum:0})

                    var _data = [];
                    var maxNotMessage = 0

                    for( var i=0 ; i < _list.length ; i++){
                        for( var ii=0 ; ii < _user.length ; ii++){
                            if( _user[ii].day > _list[i].n[0] && _user[ii].day < _list[i].n[1]){
                                _list[i].sum ++;
                            }
                        }
                    }

                    for( var i=0 ; i < _list.length ; i++){
                        _data.push({_id:_list[i].title, count:_list[i].sum})
                        maxNotMessage += _list[i].sum;
                    }

                    nut.model.notmessage = _data;
                    nut.model.maxNotMessage = maxNotMessage;
                })

                // 总人数
                var totalUser = {};
                count("customers","count",{},totalUser) ;
                // 总消息数
                var totalMessage = {};
                count("messages","count",{replyFor:{$exists:false}},totalMessage) ;

                // 用户列表
                var _page;
                helper.db.coll("welab/customers").find({}).page(20,seed.page||1,this.hold(function(err,page){
                    if(err) throw err ;
                    _page = page;
                })) ;

                this.step(function(){
                    nut.model.totalMessage = totalMessage.count;
                    //nut.model.myChart_Data = JSON.stringify({d1:nut.model.first10Total.countTotal, d2:(nut.model.totalMessages - nut.model.first10Total.countTotal)});
                    nut.model.listUser = _page;
                    console.log("nut.model.listUser",nut.model.listUser)
                })




                //互动频次begin
                var _list2=[];
                _list2.push({n:[1,10],title:"1-10", sum:0})
                _list2.push({n:[11,50],title:"11-50", sum:0})
                _list2.push({n:[51,100],title:"51-100", sum:0})
                _list2.push({n:[101,500],title:"101-500", sum:0})
                _list2.push({n:[500,100000],title:"500以上", sum:0})

                this.step(function(){

                    then.step(function(){
                        countGroup("messages","from","$from",{wechatMsgId:{$exists:true}},false);
                    })

                    //总回答互动人数
                    var totalCount=0;
                    then.step(function(){
                        var _user=nut.model.cnt;
                        for( var i=0 ; i < _list2.length ; i++){
                            for( var ii=0 ; ii < _user.length ; ii++){
                                totalCount+=_user[ii].count

                                if( _user[ii].count >= _list2[i].n[0] && _user[ii].count <= _list2[i].n[1]){
                                    _list2[i].sum ++;
                                }
                            }
                        }
                    })

                    then.step(function(){
                        console.log(JSON.stringify(_list2));
                        nut.model._list2=_list2;
                    })




                })



            }
            , viewIn: function(){

                $("#tagList").tablesorter({
                    sortList: [
                        [7, 1]
                    ],
                    sortInitialOrder:"desc"
                });


                var _data = JSON.parse( $("#myChart_Data").text())

                var data = [
                    {
                        value: _data.d1,
                        color:"#3498db",
                        label : '消息数前十的总消息数'
                    },
                    {
                        value : _data.d2,
                        color : "#b1d4e5",
                        label : '其他消息总数'
                    }
                ]

                var ctx = $("#myChart").get(0).getContext("2d");
                new Chart(ctx).Doughnut(data,{});
            }
        }
    }
}

