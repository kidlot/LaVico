var search = require("welab/lib/search.js") ;
var util = require("welab/controllers/summary/util.js") ;

module.exports = {


    layout: "welab/Layout"
    , view: "lavico/templates/userList.html"

    , process: function (seed, nut) {

        nut.model.startDate = seed.startDate
        nut.model.stopDate = seed.stopDate
        nut.model.unwind = seed.unwind
        nut.model._id = seed._id
    }
    , viewIn : function(){

        console.log("userList")

        $("#userList").flexigrid({
            url: '/lavico/bargain/userList:jsonData?unwind='+$(".unwind").val()+'&_id='+$("._id").val()+'&startDate='+$(".startDate").val()+"&stopDate="+$(".stopDate").val(),
            dataType: 'json',
            colModel : [
                {display: '<input type="checkbox" onclick="selectAllUser(this)">', name : 'input', width : 30, sortable : true},
                {display: '日期', name : $(".unwind").val()+'.createDate', width : 150, sortable : true},
                {display: '姓名', name : 'realname', width : 150, sortable : true},
                {display: '标签', name : 'tags', width : 292, sortable : true},
                {display: '成交价', name : $(".unwind").val()+'.price', width : 150, sortable : true},
                {display: '名称', name : $(".unwind").val()+'.name', width : 150, sortable : true},

                {display: '性别', name : 'gender', width : 80, sortable : true, hide:true},
                {display: '年龄', name : 'birthday', width : 80, sortable : true, hide:true},
                {display: '城市', name : 'city', width : 80, sortable : true, hide:true},
                {display: '已关注(天)', name : 'followTime', width : 70, sortable : true, hide:true},
                {display: '已注册(天)', name : 'registerTime', width : 70, sortable : true, hide:true},
                {display: '未会话(天)', name : 'lastMessageTime', width : 70, sortable : true, hide:true},
                {display: '会话数(占比)', name : 'messageCount', width : 100, sortable : true, hide:true}
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
                        conditions[seed.unwind+'.stat'] = true
                        arrregateParams.push({$unwind: "$"+seed.unwind})
                    }

                    if(seed._id){
                        conditions[seed.unwind+"._id"] = seed._id
                    }
                    arrregateParams.push({$match:conditions})
                    console.log(arrregateParams)
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
                        arrregateParams.push({$unwind: "$"+seed.unwind})
                    }

                    if(seed._id){
                        conditions[seed.unwind+"._id"] = seed._id
                    }

                    arrregateParams.push({$match:conditions})
                    arrregateParams.push({$sort:sort})

                    console.log(arrregateParams)
                    helper.db.coll("welab/customers").aggregate(
                        arrregateParams
                        ,this.hold(function(err,docs){
                            if(err) console.log(err) ;

                            try{
                                for (var i=0; i<docs.length; i++)
                                {
                                    docs[i].realname = docs[i].realname || '';
                                    docs[i].city = docs[i].city||'';
                                    docs[i].gender = docs[i].gender == 'female'?"女": (docs[i].gender == 'male' ? "男" : '')
                                    docs[i].createDate = docs[i].bargain.createDate ? new Date(docs[i].bargain.createDate + 60*60*8*1000).toISOString().substr(0,10) : ""
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

                    console.log(_data)

                    try{
                        var nodeExcel = require('excel-export');
                        var conf = {};
                        conf.cols = [
                            {
                                caption: '日期',
                                type: 'string'
                            }, {
                                caption: '姓名',
                                type: 'string'
                            }, {
                                caption: '性别',
                                type: 'string'
                            }, {
                                caption: '城市',
                                type: 'string'
                            }, {
                                caption: '手机号',
                                type: 'string'
                            }, {
                                caption: '成交价',
                                type: 'string'
                            }, {
                                caption: '状态',
                                type: 'string'
                            }, {
                                caption: '名称',
                                type: 'string'
                            }
                        ];

                        conf.rows = [];

                        for(var i=0 ;i < _data.length ;i++){

                            var rows;
                            rows = [
                                _data[i].createDate,
                                _data[i].realname,
                                _data[i].gender,
                                _data[i].city,
                                _data[i].mobile||"",
                                _data[i].bargain.stat?_data[i].bargain.price:"",
                                _data[i].bargain.stat?"成交":"放弃",
                                _data[i].bargain.name
                            ]

                            conf.rows.push(rows)

                        }
                    }catch(e){
                        if(e) console.log(e)
                    }


                    console.log(conf)

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