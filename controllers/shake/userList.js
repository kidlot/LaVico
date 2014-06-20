var search = require("welab/lib/search.js") ;
var util = require("welab/controllers/summary/util.js") ;

module.exports = {


    layout: "welab/Layout"
    , view: "lavico/templates/reedem/userList.html"

    , process: function (seed, nut) {

        nut.model.startDate = seed.startDate
        nut.model.stopDate = seed.stopDate
        nut.model.unwind = seed.unwind
        nut.model._id = seed._id
    }
    , viewIn : function(){

        //console.log("userList")
        $("#userList").flexigrid({
            url: '/lavico/shake/userList:jsonData?unwind='+$(".unwind").val()+'&startDate='+$(".startDate").val()+"&stopDate="+$(".stopDate").val()+"&_id="+$("._id").val(),
            dataType: 'json',
            colModel : [
                {display: '<input type="checkbox" onclick="selectAllUser(this)">', name : 'input', width : 30, sortable : true},
                {display: '时间', name : $(".unwind").val()+'.createDate', width : 80, sortable : true},
                {display: '微信ID', name : $(".unwind").val()+'.uid', width : 50, sortable : true},
                {display: '姓名', name : 'realname', width : 80, sortable : true},
                {display: '手机号吗', name : 'mobile', width : 100, sortable : true},
                {display: 'memberID', name :$(".unwind").val()+'.memberID', width : 80, sortable : true},
//                {display: '券名', name : $(".unwind").val()+'.promotion_name', width : 100, sortable : true},
                {display: '券号', name : $(".unwind").val()+'.coupon_no', width : 180, sortable : true},
                {display: '券中奖率', name : $(".unwind").val()+'.lottery_chance', width : 80, sortable : true},
                {display: '消耗积分', name : $(".unwind").val()+'.points', width : 80, sortable : true},
                {display: '券名称', name : $(".unwind").val()+'.display_name', width : 80, sortable : true},
//                {display: '面值', name : $(".unwind").val()+'.qty', width : 30, sortable : true},
//                {display: '性别', name : 'gender', width : 80, sortable : true, hide:true},
//                {display: '年龄', name : 'birthday', width : 80, sortable : true, hide:true},
//                {display: '省份', name : 'province', width : 80, sortable : true}
//                {display: '城市', name : 'city', width : 80, sortable : true, hide:true},
                {display: '标签', name : 'tags', width : 292, sortable : true}

            ],
            //sortname: "input",
            sortorder: "desc",
            usepager: true,
            useRp: true,
            rp: 17,
            showTableToggleBtn: true,
            width: 929,
            height: 590,
            onSuccess:function(o){
                $("#userList").find("tr").find("td").each(function(i,o){
                    $(o).click(function(){


                        if( event.srcElement.nodeName == "DIV" || event.srcElement.nodeName == "TD"){

                            if( !$(o).parent().hasClass("trSelected") ){

                                $(o).parent().find("td:eq(0)").find("input")[0].checked = true;
                            }else{
                                $(o).parent().find("td:eq(0)").find("input")[0].checked = false;
                            }
                        }
                    })
                })
            }
        });

    }
    , actions: {

        jsonData: {

            process: function (seed, nut) {

                nut.disabled = true ;

                // 总人数
                var otherData = {};
                // 总消息数
                var count = util.countor(this) ;
                count("customers","totalUser",{},otherData) ;
                count("messages","totaMessages",{replyFor:{$exists:false}},otherData) ;
                count("replyViewLog","totalView",{action:"view"},otherData) ;
                count("replyViewLog","totalShare",{$or:[{action:"share.friend"},{action:"share.timeline"}]},otherData) ;
                count("replyViewLog","totalViewFriend",{$or:[{action:"view.friend"},{action:"view.timeline"}]},otherData) ;

                var conditions = search.conditions(seed) || {} ;
                var _data = {};
                var _rows = [];

                var sort = {_id:-1};
                if(seed.sortname){

                    var order = seed.sortorder == "asc" ? 1 : -1;
                    sort = eval("({\""+seed.sortname+"\":"+order+"})")
                }


                this.step(function(){

                    var arrregateParams = [
                    ]

                    if(seed.unwind){
                        conditions[seed.unwind+".createDate"] = {$gt:new Date(seed.startDate + " 00:00:00").getTime(), $lt:new Date(seed.stopDate + " 23:59:59").getTime()}
                        arrregateParams.push({$unwind: "$"+seed.unwind})
                    }

                    if(seed._id){
                        conditions[seed.unwind+".aid"] = seed._id
                    }
                    arrregateParams.push({$match:conditions})
                    //console.log(arrregateParams)
                    helper.db.coll("welab/customers").aggregate(
                        arrregateParams
                        ,this.hold(function(err,docs){
                            if(err) console.log(err) ;
                            _data.page = (parseInt(seed.page)||1)
                            _data.total = docs.length

                        })
                    );

                    arrregateParams.push({$sort:sort})
                    arrregateParams.push({$skip:((parseInt(seed.page)-1)||0)*(parseInt(seed.rp) || 20)})
                    arrregateParams.push({$limit:(parseInt(seed.rp) || 20)})
                    helper.db.coll("welab/customers").aggregate(
                        arrregateParams
                        ,this.hold(function(err,docs){
                            if(err) console.log(err) ;

                            for (var i=0; i<docs.length; i++)
                            {
                                docs[i].input = '<input type="checkbox" userid="'+docs[i]._id+'" onclick="checkUser(this)" >';
                                docs[i].realname = docs[i].realname || '未注册用户';
                                docs[i].city = docs[i].city || '';
                                docs[i].followCount = docs[i].followCount || '1';
                                docs[i].messageCount = docs[i].messageCount && otherData.totaMessages ? (docs[i].messageCount) + " <span style='color: #1ABC9C'>" + (parseInt((docs[i].messageCount / otherData.totaMessages)*100)) + "%</span>" : "0";
                                docs[i].isRegister = docs[i].registerTime ? "是" : "否"
                                docs[i].gender = docs[i].gender == 'female'?"女": (docs[i].gender == 'male' ? "男" : '未知')
                                docs[i].birthday = parseInt(((new Date()) - (parseInt(docs[i].birthday))) / (1000*60*60*24*365))

                                var tags = [];
                                if( docs[i].tags){
                                    for (var ii=0; ii<docs[i].tags.length; ii++)
                                    {
                                        tags.push('<span class="tm-tag tm-tag-info" ><span>'+docs[i].tags[ii]+'</span></span>')
                                    }
                                }
                                docs[i].tags = tags.join("&nbsp;")
                                docs[i].followTimebak = docs[i].followTime;
                                docs[i].followTime = parseInt(((new Date()) - (new Date(docs[i].followTime*1000))) / (1000*60*60*24))
                                docs[i].registerTime = parseInt(((new Date()) - (new Date(docs[i].registerTime))) / (1000*60*60*24))
                                docs[i].lastMessageTime = parseInt(((new Date()) - (new Date(docs[i].lastMessageTime))) / (1000*60*60*24))
                                docs[i].isBlacklist = "否"
                                docs[i].viewCount = docs[i].viewCount && otherData.totalView ? (docs[i].viewCount) + " <span style='color: #1ABC9C'>" + (parseInt((docs[i].viewCount / otherData.totalView)*100)) + "%</span>" : "0";


                                for(var oi in docs[i]){

                                    if(typeof(docs[i][oi]) == "object"){
                                        for(var oii in docs[i][oi]){

                                            if(oii == "createDate"){

                                                docs[i][oi+"."+oii] = new Date(docs[i][oi][oii] + 60*60*8*1000).toISOString().substr(0,10)
                                            }else{

                                                docs[i][oi+"."+oii] = docs[i][oi][oii]
                                            }
                                        }
                                    }
                                }


                                _rows.push(docs[i])
                            }

                            _data.rows = _rows;
                        })
                    );

                })



                this.step(function(){

                    var data = JSON.stringify(_data);
                    this.res.writeHead(200, { 'Content-Type': 'application/json' });
                    this.res.write(data);
                    this.res.end();
                })
            }

        }


        , exports: {

            process: function (seed, nut) {

                nut.disabled = true ;

                var conditions = search.conditions(seed) || {} ;
                console.log('---------seed.conditions-----------');
                //console.log(seed.conditions);
                console.log('---------seed.conditions-----------');
                //this.terminate();
                var _data = {};
                var _rows = [];

                var sort = {_id:-1};
                if(seed.sortname){

                    var order = seed.sortorder == "asc" ? 1 : -1;
                    sort = eval("({\""+seed.sortname+"\":"+order+"})")
                }


                this.step(function(){

                    var arrregateParams = [
                        {$match:conditions}
                    ]

                    if(seed.unwind){
                        arrregateParams.push({$unwind: "$"+seed.unwind})
                    }
                    console.log('---------arrregateParams-----------');
                    //console.log(arrregateParams);
                    console.log('---------arrregateParams-----------');


                    if(seed._id){
                        conditions[seed.unwind+".aid"] = seed._id
                    }
                    arrregateParams.push({$match:conditions})

                    arrregateParams.push({$sort:sort});
                    console.log('---------seed._id-----------');
                    console.log(seed._id);
                    console.log('---------seed._id-----------');

                    helper.db.coll("welab/customers").aggregate(
                        arrregateParams
                        ,this.hold(function(err,docs){
                            if(err) console.log(err) ;
                            console.log('---------docs-----------');
                            //console.log(docs);
                            console.log('---------docs-----------');
                            //this.terminate()
                            try{
                                for (var i=0; i<docs.length; i++)
                                {
                                    docs[i].realname = docs[i].realname || '未注册用户';
                                    docs[i].province = docs[i].province || '';
                                    docs[i].mobile = docs[i].mobile || '';
                                    docs[i].city = docs[i].city || '';
                                    docs[i].followCount = docs[i].followCount || '1';
                                    docs[i].messageCount = docs[i].messageCount;
                                    docs[i].isRegister = docs[i].registerTime ? "是" : "否"
                                    docs[i].gender = docs[i].gender == 'female'?"女": (docs[i].gender == 'male' ? "男" : '未知')
                                    docs[i].birthday = docs[i].birthday ? parseInt(((new Date()) - (parseInt(docs[i].birthday))) / (1000*60*60*24*365)) : "未知"

                                    var tags = [];
                                    if( docs[i].tags){
                                        for (var ii=0; ii<docs[i].tags.length; ii++)
                                        {
                                            tags.push(docs[i].tags[ii])
                                        }
                                    }
                                    docs[i].tags = tags.join(",")
                                    docs[i].followTimebak = docs[i].followTime;
                                    docs[i].followTime = docs[i].followTime ? new Date(docs[i].followTime*1000).toISOString().substr(0,10) : "未知"
                                    docs[i].registerTime = docs[i].registerTime ? new Date(docs[i].registerTime).toISOString().substr(0,10) : "未知"
                                    docs[i].lastMessageTime = docs[i].lastMessageTime ? new Date(docs[i].lastMessageTime).toISOString().substr(0,10) : "未知"
                                    _rows.push(docs[i])
                                }
                            }catch(e){
                                if(e) console.log(e)
                            }


                            _data = _rows;
                        })
                    );

                })



                this.step(function(){

                    //console.log(_data)

                    try{
                        var nodeExcel = require('excel-export');
                        var conf = {};
                        conf.cols = [
                            {
                                caption: '姓名',
                                type: 'string'
                            }, {
                                caption: '省份',
                                type: 'string'
                            }, {
                                caption: '城市',
                                type: 'string'
                            }, {
                                caption: '性别',
                                type: 'string'
                            },{
                                caption: '手机号码',
                                type: 'string'
                            }
                        ];

                        if(seed.unwind && seed.data){
                            var data = JSON.parse(seed.data)
                            for(var ii in data){
                                conf.cols.push({
                                    caption: data[ii],
                                    type: 'string'
                                })
                            }
                        }
                        conf.rows = [];

                        for(var i=0 ;i < _data.length ;i++){

                            var rows;
                            rows = [
                                _data[i].realname,
                                _data[i].province,
                                _data[i].city,
                                _data[i].gender,
                                _data[i].mobile
                            ]

                            if(seed.unwind && seed.data){
                                var data = JSON.parse(seed.data)
                                for(var ii in data){
                                    if(ii == "createDate"){
                                        var val = new Date(_data[i][seed.unwind][ii] + 60*60*8*1000).toISOString().substr(0,10)
                                    }else{
                                        var val = _data[i][seed.unwind][ii]
                                    }

                                    rows.push(
                                        val
                                    )

                                }
                            }
                            conf.rows.push(rows)

                        }
                    }catch(e){
                        if(e) console.log(e)
                    }


                    //console.log(conf)

                    var result = nodeExcel.execute(conf);
                    this.res.setHeader('Content-Type', 'application/vnd.openxmlformats');
                    this.res.setHeader("Content-Disposition", "attachment; filename=Report.xlsx");
                    this.res.write(result, 'binary');
                    return this.res.end();
                })
            }

        }
    }

}
