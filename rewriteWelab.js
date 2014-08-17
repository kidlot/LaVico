var search = require("welab/lib/search.js") ;
var summary = require("welab/controllers/user/summary.js") ;
var util = require("welab/controllers/summary/util.js") ;
var middleware = require('lavico/lib/middleware.js');//引入中间件
exports.load = function () {

    var summaryUserTrend = require("welab/controllers/summary/userTrend.js");
//    summaryUserTrend.children.page = {
//
//        layout: "welab/Layout"
//        , view: "lavico/templates/summary/userTrendPage.html"
//
//        , process: function (seed, nut) {
//
//            var start = seed.start? util.toStartAndEnd(seed.start).start: util.getFirstDay() ;
//            var end = seed.end? util.toStartAndEnd(seed.end).end : util.getLastDay() ;
//
//
//            nut.model.start =  util.toDate(start).str ;
//            nut.model.end = util.toDate(end).str ;
//
//            //console.log(util.toDateTime(start).str +"*"+util.toDateTime(end).str)
//            var count = util.countor(this) ;
//
//            // 统计用户数据
//            count("customers","subscribeCustomers",{isFollow:true}) ;
//            count("customers","unsubscribeCustomers",{isFollow:false}) ;
//            count("customers","registerCustomers",{registerTime:{$exists:true}}) ;
//
//            // by day
//            var days = Math.ceil( (end - start)/(60*60*24*1000) )  ;
//
//            nut.model.byDays = {} ;
//
//            for(var d=0;d<days;d++)
//            {
//                var day = new Date( start.getTime() + d*60*60*24*1000 ) ;
//
//                //day = new Date(day.getFullYear(),day.getMonth(),day.getDate()) ;
//                var dayEnd = new Date(day.getTime()+60*60*24*999.99) ;
//
//                var model = (nut.model.byDays[util.toDate(day).str] = {}) ;
//
//                //console.log(util.toDateTime(day).str +"|"+util.toDateTime(dayEnd).str)
//
//                var countGroup = util.countGroup(this,day,dayEnd) ;
//                var countNoDate = util.countor(this) ;
//                // 统计用户数据
//                countGroup("feeds","subscribeCustomers","$uid",{title:"关注"},model) ;
//                countGroup("feeds","unsubscribeCustomers","$uid",{title:"取消关注"},model) ;
//                countNoDate("customers","registerCustomers",{registerTime:{
//                    $gt:day.getTime()
//                    , $lt:dayEnd.getTime()
//                }},model) ;
//
//                // 累计
//                countNoDate("customers","totalRegisterCustomers",{registerTime:{
//                    $gt:new Date("1900-01-01").getTime()
//                    , $lt:dayEnd.getTime()
//                }},model) ;
//                var count = util.countor(this,new Date("1900-01-01"),dayEnd) ;
//                count("feeds","totalUnsubscribeCustomers",{title:"取消关注"},model) ;
//                count("feeds","totalSubscribeCustomers",{title:"关注"},model) ;
//            }
//
//            this.step(function(){
//                nut.model.jsonData = JSON.stringify(nut.model.byDays);
//                //console.log(nut.model) ;
//            }) ;
//        }
//        , viewIn: function(){
//
//
//            $(".number").each(function(i,o){
//                $(o).text( changv($(o).text()))
//                $(o).animate({
//                    opacity: 1
//                }, 150);
//            })
//
//
//            $("#tagList").tablesorter({
//                sortList: [
//                    [0, 1]
//                ],
//                sortInitialOrder:"desc"
//            });
//
//
//            $('#datetimepicker_s').datetimepicker({
//                format: 'yyyy-mm-dd',
//                autoclose: true,
//                minView: 2
//            }).on('changeDate', function(ev)
//                {
//                    $.controller("/welab/summary/userTrend:page",{
//                        start: $("#datetimepicker_s").val() ,
//                        end: $("#datetimepicker_t").val()
//                    },'.childview:last()>.ocview') ;
//                });
//
//            $('#datetimepicker_t').datetimepicker({
//                format: 'yyyy-mm-dd',
//                autoclose: true,
//                minView: 2,
//                endDate: new Date()
//            }).on('changeDate', function(ev)
//                {
//                    $.controller("/welab/summary/userTrend:page",{
//                        start: $("#datetimepicker_s").val() ,
//                        end: $("#datetimepicker_t").val()
//                    },'.childview:last()>.ocview') ;
//                });
//
//
//            byDay();
//
//            chatr.empty();
//            chatr.labels( adata.labels);
//
//            chatr.addItem("",adata.subscribeCustomers,"94,208,186");
//            chatr.addItem("",adata.unsubscribeCustomers,"189,195,202");
//            chatr.addItem("",adata.growthSubscribeCustomers,"108,170,217");
//            chatr.addItem("",adata.registerCustomers,"240,129,118");
//
//            chatr.drawLine($("#myChart").get(0).getContext("2d"));
//
//
//            $(".btn-group-class1 > button").click(function(){
//
//                $(this).toggleClass("active")
//                $(".btn-group-class2 > button").removeClass("active")
//
//                chatr.empty();
//                chatr.labels( adata.labels);
//                $(".btn-group-class1 > button").each(function(i,e){
//                    if( $(e).hasClass( "active")){
//                        chatr.addItem("",adata[$(e).attr("field")],$(e).attr("color"));
//                    }
//                })
//                chatr.drawLine($("#myChart").get(0).getContext("2d"));
//            })
//            $(".btn-group-class2 > button").click(function(){
//
//                $(this).toggleClass("active")
//                $(".btn-group-class1 > button").removeClass("active")
//
//                chatr.empty();
//                chatr.labels( adata.labels);
//                $(".btn-group-class2 > button").each(function(i,e){
//                    if( $(e).hasClass( "active")){
//                        chatr.addItem("",adata[$(e).attr("field")],$(e).attr("color"));
//                    }
//                })
//                chatr.drawLine($("#myChart").get(0).getContext("2d"));
//            })
//            $(".btn-group-class3 > button").click(function(){
//
//                $(".btn-group-class3 > button").removeClass("active")
//                $(this).addClass("active")
//
//                $(".btn-group-class1 > button").addClass("active")
//                $(".btn-group-class2 > button").removeClass("active")
//
//                if( $(this).text() =="日"){
//                    byDay()
//                }
//                if( $(this).text() =="周"){
//                    byWeek()
//                }
//                if( $(this).text() =="月"){
//                    byMonth()
//                }
//                chatr.empty();
//                chatr.labels( adata.labels);
//
//                chatr.addItem("",adata.subscribeCustomers,"94,208,186");
//                chatr.addItem("",adata.unsubscribeCustomers,"189,195,202");
//                chatr.addItem("",adata.growthSubscribeCustomers,"108,170,217");
//                chatr.addItem("",adata.registerCustomers,"240,129,118");
//
//                chatr.drawLine($("#myChart").get(0).getContext("2d"));
//
//            })
//
//        }
//
    var welabUserlist = require("welab/controllers/user/list.js");
    // 复写用户列表的导出
    welabUserlist.actions.exports.process = function(seed, nut){
        nut.disabled = true ;
        var UserList = seed.UserList.split(",");
        var resultList=[];
        var then = this;

        this.step(function(){
            for(var i=0;i<UserList.length;i++){
                (function(i){
//                    console.log("UserList[i]",UserList[i])
                    helper.db.coll("welab/customers").findOne({"_id":helper.db.id(UserList[i])},then.hold(function(err,doc){
                        if(err) throw err;
//                        console.log("doc",doc)
                        if(doc){
                            var result={};
                            result.nickname = doc.nickname || "--";
                            result.realname = doc.realname || "--";
                            result.gender = doc.gender == 'female'?"女": (doc.gender == 'male' ? "男" : '--');
                            result.birthday = doc.birthday ?parseInt(new Date().getFullYear()-parseInt(new Date(doc.birthday).getFullYear())):"--"
                                result.mobile = doc.mobile || "--";
                            result.profession = doc.profession || "--";
                            result.email = doc.email || "--";
                            result.province = doc.province || "--";
                            result.city = doc.city || "--";
                            result.address = doc.address || "--";

                            if(doc.HaiLanMemberInfo && doc.HaiLanMemberInfo.type){
                                if(doc.HaiLanMemberInfo.type == 1){
                                    doc.cardtype = '白卡';
                                }else if(doc.HaiLanMemberInfo.type == 2){
                                    doc.cardtype = 'VIP卡';
                                }else if(doc.HaiLanMemberInfo.type == 3){
                                    doc.cardtype = '白金VIP卡';
                                }else{
                                    doc.cardtype = '未知';
                                }
                            }else{
                                doc.cardtype = '--';
                            }
                            result.cardtype = doc.cardtype;

                            if(doc.HaiLanMemberInfo && doc.HaiLanMemberInfo.cardNumber){
                                doc.cardNumber = doc.HaiLanMemberInfo.cardNumber;
                            }else{
                                doc.cardNumber = '--';
                            }
                            result.cardNumber = doc.cardNumber;

                            if(doc.HaiLanMemberInfo && doc.HaiLanMemberInfo.favoriteStyle){
                                doc.favoriteStyle = doc.HaiLanMemberInfo.favoriteStyle;
                            }else{
                                doc.favoriteStyle = '--';
                            }
                            result.favoriteStyle = doc.favoriteStyle;

                            if(doc.HaiLanMemberInfo && doc.HaiLanMemberInfo.memberID){
                                doc.memberID = doc.HaiLanMemberInfo.memberID;
                            }else{
                                doc.memberID = '--';
                            }
                            result.memberID = doc.memberID;

                            if(doc.HaiLanMemberInfo && doc.HaiLanMemberInfo.favoriteColor){
                                doc.favoriteColor = doc.HaiLanMemberInfo.favoriteColor;
                            }else{
                                doc.favoriteColor = '--';
                            }
                            result.favoriteColor = doc.favoriteColor;

                            var tags = [];
                            if(doc.tags){
                                for (var j=0; j<doc.tags.length; j++)
                                {
                                        tags.push(doc.tags[j]);
                                }
                                doc.tags = tags.join(",");
                            }else{
                                doc.tags = '--';
                            }
                            result.tags = tags;

                            result.source = doc.source || '--';
                            resultList.push(result);
                        }
                    }))
                })(i)
            }
        })

        this.step(function(){
            var nodeExcel = require('excel-export');
            var conf = {};
            conf.cols = [
                {
                    caption: '昵称',
                    type: 'string'
                }, {
                    caption: '姓名',
                    type: 'string'
                }, {
                    caption: '性别',
                    type: 'string'
                }, {
                    caption: '年龄',
                    type: 'string'
                }, {
                    caption: '手机',
                    type: 'string'
                }, {
                    caption: '行业',
                    type: 'string'
                }, {
                    caption: 'Email',
                    type: 'string'
                }, {
                    caption: '省份',
                    type: 'string'
                }, {
                    caption: '城市',
                    type: 'string'
                }, {
                    caption: '具体地址',
                    type: 'string'
                }, {
                    caption: '喜好款式',
                    type: 'string'
                }, {
                    caption: '喜好颜色',
                    type: 'string'
                }, {
                    caption: '卡类型',
                    type: 'string'
                }, {
                    caption: '卡号码',
                    type: 'string'
                }, {
                    caption: '会员号码',
                    type: 'string'
                }, {
                    caption: '关注来源',
                    type: 'string'
                }, {
                    caption: '标签',
                    type: 'string'
                }
            ];
            conf.rows = [];
            for(var i=0 ;i < resultList.length ;i++){
                var rows;
                rows = [
                    resultList[i].nickname,
                    resultList[i].realname,
                    resultList[i].gender,
                    resultList[i].birthday,
                    resultList[i].mobile,
                    resultList[i].profession,
                    resultList[i].email,
                    resultList[i].province,
                    resultList[i].city,
                    resultList[i].address,
                    resultList[i].favoriteStyle,
                    resultList[i].favoriteColor,
                    resultList[i].cardtype,
                    resultList[i].cardNumber,
                    resultList[i].memberID,
                    resultList[i].source,
                    resultList[i].tags
                ]
                conf.rows.push(rows)
            }
            var result = nodeExcel.execute(conf);
            this.res.setHeader('Content-Type', 'application/vnd.openxmlformats');
            this.res.setHeader("Content-Disposition", "attachment; filename=Report.xlsx");
            this.res.write(result, 'binary');
            this.res.end();
        })
//        nut.disabled = true ;
//
//        // 总人数
//        var otherData = {};
//        // 总消息数
//        var count = util.countor(this) ;
//        count("customers","totalUser",{},otherData) ;
//        count("messages","totaMessages",{replyFor:{$exists:false}},otherData) ;
//        count("replyViewLog","totalView",{action:"view"},otherData) ;
//        count("replyViewLog","totalShare",{$or:[{action:"share.friend"},{action:"share.timeline"}]},otherData) ;
//        count("replyViewLog","totalViewFriend",{$or:[{action:"view.friend"},{action:"view.timeline"}]},otherData) ;
//
//        var conditions = search.conditions(seed) ;
//        var _data = [];
//
//        var sort = {_id:-1};
//        if(seed.sortname){
//
//            var order = seed.sortorder == "asc" ? 1 : -1;
//            sort = eval("({"+seed.sortname+":"+order+"})")
//        }
//
//
//        this.step(function(){
//            //console.log("tip:"+conditions);
//            helper.db.coll("welab/customers").find({"_id":helper.db.id("53a8ff09d94e071568000c72")}).toArray(this.hold(function(err,docs){
//                if(err) throw err ;
//
//                for (var i=0; i<docs.length; i++)
//                {
//                    docs[i].realname = docs[i].realname || '';
//                    docs[i].nickname = docs[i].nickname || '';
//                    docs[i].province = docs[i].province || '';
//                    docs[i].city = docs[i].city || '';
//                    docs[i].address = docs[i].address || '';
//
//                    docs[i].followCount = docs[i].followCount || '1';
//                    docs[i].messageCount = docs[i].messageCount && otherData.totaMessages ? (docs[i].messageCount) + " " + (parseInt((docs[i].messageCount / otherData.totaMessages)*100)) + "%" : "0";
//                    docs[i].isRegister = docs[i].registerTime ? "是" : "否"
//                    docs[i].gender = docs[i].gender == 'female'?"女": (docs[i].gender == 'male' ? "男" : '--')
//                    docs[i].birthday = docs[i].birthday ? parseInt(((new Date()) - (parseInt(docs[i].birthday))) / (1000*60*60*24*365)) : ""
//
//                    docs[i].source = docs[i].source || '';
//                    docs[i].mobile = docs[i].mobile || '';
//
//                    if(docs[i].HaiLanMemberInfo&&docs[i].HaiLanMemberInfo.type){
//                        if(docs[i].HaiLanMemberInfo.type == 1){
//                            docs[i].cardtype = '白卡';
//                        }else if(docs[i].HaiLanMemberInfo.type == 2){
//                            docs[i].cardtype = 'VIP卡';
//                        }else if(docs[i].HaiLanMemberInfo.type == 3){
//                            docs[i].cardtype = '白金VIP卡';
//                        }else{
//                            docs[i].cardtype = '未知';
//                        }
//                    }else{
//                        docs[i].cardtype = '--';
//                    }
//
//                    if(docs[i].HaiLanMemberInfo&&docs[i].HaiLanMemberInfo.cardNumber){
//                        docs[i].cardNumber = docs[i].HaiLanMemberInfo.cardNumber;
//                    }else{
//                        docs[i].cardNumber = '--';
//                    }
//
//                    if(docs[i].HaiLanMemberInfo&&docs[i].HaiLanMemberInfo.favoriteStyle){
//                        docs[i].favoriteStyle = docs[i].HaiLanMemberInfo.favoriteStyle;
//                    }else{
//                        docs[i].favoriteStyle = '--';
//                    }
//
//                    if(docs[i].HaiLanMemberInfo&&docs[i].HaiLanMemberInfo.memberID){
//                        docs[i].memberID = docs[i].HaiLanMemberInfo.memberID;
//                    }else{
//                        docs[i].memberID = '--';
//                    }
//
//                    if(docs[i].HaiLanMemberInfo&&docs[i].HaiLanMemberInfo.favoriteColor){
//                        docs[i].favoriteColor = docs[i].HaiLanMemberInfo.favoriteColor;
//                    }else{
//                        docs[i].favoriteColor = '--';
//                    }
//
//
//                    docs[i].industry = docs[i].profession || '';
//                    docs[i].email = docs[i].email || '';
//
//                    var tags = [];
//                    if(docs[i].tags){
//                        for (var ii=0; ii<docs[i].tags.length; ii++)
//                        {
//                                tags.push(docs[i].tags[ii]);
//                        }
//                        docs[i].tags = tags.join(",");
//                    }else{
//                        docs[i].tags = '';
//                    }
//
//                    _data.push(docs[i]);
//
//                }
//
//            }));
//
//        })
//
//
//        //导出
//        this.step(function(){
//
//            var nodeExcel = require('excel-export');
//
//            var conf = {};
//
//            conf.cols = [
//                {
//                    caption: '昵称',
//                    type: 'string'
//                }, {
//                    caption: '姓名',
//                    type: 'string'
//                }, {
//                    caption: '性别',
//                    type: 'string'
//                }, {
//                    caption: '年龄',
//                    type: 'string'
//                }, {
//                    caption: '手机',
//                    type: 'string'
//                }, {
//                    caption: '行业',
//                    type: 'string'
//                }, {
//                    caption: 'Email',
//                    type: 'string'
//                }, {
//                    caption: '省份',
//                    type: 'string'
//                }, {
//                    caption: '城市',
//                    type: 'string'
//                }, {
//                    caption: '具体地址',
//                    type: 'string'
//                }, {
//                    caption: '喜好款式',
//                    type: 'string'
//                }, {
//                    caption: '喜好颜色',
//                    type: 'string'
//                }, {
//                    caption: '卡类型',
//                    type: 'string'
//                }, {
//                    caption: '卡号码',
//                    type: 'string'
//                }, {
//                    caption: '会员号码',
//                    type: 'string'
//                }, {
//                    caption: '关注来源',
//                    type: 'string'
//                }, {
//                    caption: '标签',
//                    type: 'string'
//                }
//            ];
//
//
//            conf.rows = [];
//
//            for(var i=0 ;i < _data.length ;i++){
//                var rows;
//                rows = [
//                    _data[i].nickname,
//                    _data[i].realname,
//                    _data[i].gender,
//                    _data[i].birthday,
//                    _data[i].mobile,
//                    _data[i].industry,
//                    _data[i].email,
//                    _data[i].province,
//                    _data[i].city,
//                    _data[i].address,
//                    _data[i].favoriteStyle,
//                    _data[i].favoriteColor,
//                    _data[i].cardtype,
//                    _data[i].cardNumber,
//                    _data[i].memberID,
//                    _data[i].source,
//                    _data[i].tags
//                ]
//                conf.rows.push(rows)
//
//            }
//            var result = nodeExcel.execute(conf);
//            console.log(conf);
//
//            this.res.setHeader('Content-Type', 'application/vnd.openxmlformats');
//            this.res.setHeader("Content-Disposition", "attachment; filename=Report.xlsx");
//            this.res.write(result, 'binary');
//            this.res.end();
//
//        })
    }
    //短信发送  viewIn
    welabUserlist.children.page.viewIn = function(){
        /**
         * 消息
         */
        $(".sendMessageBtn").on("click",function(){
            var oUserSetOption = {} ;
            oUserSetOption.data = [];
            oUserSetOption.data.push({name:"sUserList",value:getUserList().join(",")});
            oUserSetOption.data.push({name:"sContent",value:$("#sendMessageValue").val()});
            oUserSetOption.type = "POST";
            oUserSetOption.url = "/welab/user/form:sendMessage";

            $.request(oUserSetOption,function(err,nut){
                if(err) throw err ;
                $("#sendMessageValue").val("")
                nut.msgqueue.popup() ;

            }) ;

            $('#sendMessageModal').modal('toggle');
            return false;

        });
    }

    //标签管理
    welabUserlist.children.page.process = function (seed,nut){
        this.step(function(){
            helper.db.coll("lavico/tags").find({}).toArray(this.hold(function(err,docs){
                if(err) throw  err;
                nut.model.taglist = docs || {};
            }))
        })
    }

    // 复写用户列表
    welabUserlist.actions.jsonData.process = function(seed, nut){
        nut.disabled = true ;

        // 总人数
        var otherData = {};

        //门店信息
        var storeList;

        // 总消息数
        var count = util.countor(this) ;

        count("customers","totalUser",{},otherData) ;
        count("messages","totaMessages",{replyFor:{$exists:false}},otherData) ;
        count("replyViewLog","totalView",{action:"view"},otherData) ;
        count("replyViewLog","totalShare",{$or:[{action:"share.friend"},{action:"share.timeline"}]},otherData) ;
        count("replyViewLog","totalViewFriend",{$or:[{action:"view.friend"},{action:"view.timeline"}]},otherData) ;

//        console.log('*************0*************');
//        console.log(JSON.stringify(seed));
//        console.log('*************0*************');

        var conditions = search.conditions(seed) ;

        var _data = {};
        var _rows = [];

        var sort = {_id:-1};
        if(seed.sortname){

            var order = seed.sortorder == "asc" ? 1 : -1;
            sort = eval("({"+seed.sortname+":"+order+"})")
        }


        // 同步数据
        helper.db.coll("feeds").aggregate(
            [
                {$match:{title:"关注"}},
                {$group:{
                    _id:"$uid",
                    count: {$sum: 1}
                }}
            ]
            , this.hold(function(err,cnt){

                for (var i=0; i<cnt.length; i++)
                {
                    (function(doc){

                        helper.db.coll("customers").update(
                            { _id: helper.db.id(doc._id) }
                            , {$set:{followCount:doc.count}}
                            , function(err){
                                err && console.log(err) ;
                            }
                        ) ;
                    })(cnt[i])
                }
            })
        ) ;


        this.step(function(){
            /*关注来源数字与门店对应，查询lavico/stores表*/
            helper.db.coll("lavico/stores").find().sort({createTime:-1}).limit(1).toArray(this.hold(function(err,doc){

                if(err) throw err ;
                if(doc&&doc[0]&&doc[0].storeList){
                    storeList = doc[0].storeList;
                }else{
                    storeList = false;
                }
            }));
        })
        this.step(function(){


            //关注时间 任意
            if(conditions && conditions.$or && conditions.$or[0] && conditions.$or[0].followTime){
//                console.log(JSON.stringify(conditions));
//                console.log(conditions.$or[0].followTime.$gt)
                conditions.$or[0].followTime.$gt = parseInt(conditions.$or[0].followTime.$gt/1000);
                conditions.$or[0].followTime.$lt = parseInt(conditions.$or[0].followTime.$lt/1000);

            }

            //关注时间 全部
            if(conditions && conditions.$and && conditions.$and[0] && conditions.$and[0].followTime){
                conditions.$and[0].followTime.$gt = parseInt(conditions.$and[0].followTime.$gt/1000);
                conditions.$and[0].followTime.$lt = parseInt(conditions.$and[0].followTime.$lt/1000);
            }
            //年龄 任意
            if(conditions && conditions.$or && conditions.$or[0] && conditions.$or[0].birthday){
                if(conditions.$or[0].birthday.$gt){
                    conditions.$or[0].birthday.$gt =new Date((parseInt(new Date().getFullYear()-parseInt(conditions.$or[0].birthday.$gt)))+"-12-31 23:59:59").getTime();
                }else if(conditions.$or[0].birthday.$lt){
                    conditions.$or[0].birthday.$lt =new Date((parseInt(new Date().getFullYear()-parseInt(conditions.$or[0].birthday.$lt)))+"-01-01 00:00:00").getTime();
                }else if(conditions.$or[0].birthday.$lte){
                    conditions.$or[0].birthday.$lte =new Date((parseInt(new Date().getFullYear()-parseInt(conditions.$or[0].birthday.$lte)))+"-12-31 23:59:59").getTime();
                }else if(conditions.$or[0].birthday.$gte){
                    conditions.$or[0].birthday.$gte =new Date((parseInt(new Date().getFullYear()-parseInt(conditions.$or[0].birthday.$gte)))+"-01-01 00:00:00").getTime();
                }else{
                    var gt = new Date((parseInt(new Date().getFullYear()-parseInt(conditions.$or[0].birthday)))+"-01-01 00:00:00").getTime();
                    var lt = new Date((parseInt(new Date().getFullYear()-parseInt(conditions.$or[0].birthday)))+"-12-31 23:59:59").getTime();
                    var investigation  = {$gte:gt,$lte:lt};
                    conditions.$or[0].birthday=investigation;
                }
            }
            //年龄 全部
            if(conditions && conditions.$and && conditions.$and[0] && conditions.$and[0].birthday){
                if(conditions.$and[0].birthday.$gt){
                    conditions.$and[0].birthday.$gt =new Date((parseInt(new Date().getFullYear()-parseInt(conditions.$and[0].birthday.$gt)))+"-12-31 23:59:59").getTime();
                }else if(conditions.$and[0].birthday.$lt){
                    conditions.$and[0].birthday.$lt =new Date((parseInt(new Date().getFullYear()-parseInt(conditions.$and[0].birthday.$lt)))+"-01-01 00:00:00").getTime();
                }else if(conditions.$and[0].birthday.$lte){
                    conditions.$and[0].birthday.$lte =new Date((parseInt(new Date().getFullYear()-parseInt(conditions.$and[0].birthday.$lte)))+"-12-31 23:59:59").getTime();
                }else if(conditions.$and[0].birthday.$gte){
                    conditions.$and[0].birthday.$gte =new Date((parseInt(new Date().getFullYear()-parseInt(conditions.$and[0].birthday.$gte)))+"-01-01 00:00:00").getTime();
                }else{
                    var gt = new Date((parseInt(new Date().getFullYear()-parseInt(conditions.$and[0].birthday)))+"-01-01 00:00:00").getTime();
                    var lt = new Date((parseInt(new Date().getFullYear()-parseInt(conditions.$and[0].birthday)))+"-12-31 23:59:59").getTime();
                    var investigation  = {$gte:gt,$lte:lt};
                    conditions.$and[0].birthday=investigation;
                }
            }

//            helper.db.coll("welab/customers").find(conditions).toArray(this.hold(function(err,docs){
//                console.log(docs);
//            }));




            helper.db.coll("welab/customers").find(conditions).sort(sort).page((parseInt(seed.rp) || 20),seed.page||1,this.hold(function(err,page){
                if(err) throw err ;
//                console.log(page);
                _data.page = page.currentPage
                _data.total = page.totalcount

                for (var i=0; i<page.docs.length; i++)
                {
                    page.docs[i].input = '<input type="checkbox" userid="'+page.docs[i]._id+'" id="'+page.docs[i]._id+'" onclick="checkUser(this)" >';
                    page.docs[i].realname = '<a href="/welab/user/detail?_id='+page.docs[i]._id+'" class="stay-top">'+ (page.docs[i].realname || '') +'</a>'         ;
                    page.docs[i].nickname = '<a href="/welab/user/detail?_id='+page.docs[i]._id+'" class="stay-top">'+ (page.docs[i].nickname || '') +'</a>'         ;
                    page.docs[i].city = page.docs[i].city || '';
                    page.docs[i].followCount = page.docs[i].followCount || '1';
                    page.docs[i].messageCount = page.docs[i].messageCount && otherData.totaMessages ? (page.docs[i].messageCount) + " <span style='color: #1ABC9C'>" + (parseInt((page.docs[i].messageCount / otherData.totaMessages)*100)) + "%</span>" : "0";
                    page.docs[i].isRegister = page.docs[i].registerTime ? "是" : "否"
                    page.docs[i].gender = page.docs[i].gender == 'female'?"女": (page.docs[i].gender == 'male' ? "男" : '')
                    page.docs[i].birthday = page.docs[i].birthday ?parseInt(new Date().getFullYear()-new Date(page.docs[i].birthday).getFullYear()):""
//                        parseInt(((new Date()) - (parseInt(page.docs[i].birthday))) / (1000*60*60*24*365)) : ""
                    //parseInt(new Date().getFullYear()-new Date(page.docs[i].birthday).getFullYear()):""
                    page.docs[i].source = page.docs[i].source || '';

                    /*门店查询David.xu-2014-07-23*/
                    if(page.docs[i].source&&storeList){

                        var _source = [];
                        var _sourceObject = page.docs[i].source;

                        for(var _i in _sourceObject){

                            if(_i == 0){
                                _sourceObject[_i] = storeList[_sourceObject[_i]][1];
                                _source =  [_sourceObject[_i]];
                            }
                            //_sourceObject[_i] = storeList[_sourceObject[_i]][1];
                        }
                        page.docs[i].source = _source || '';
                    }

                    page.docs[i].cardtype = page.docs[i].cardtype || '微信会员卡';
                    page.docs[i].industry = page.docs[i].profession || '';

                    var cardtype = {1:"白卡", 2:"VIP卡", 3:"白金VIP卡"}
                    page.docs[i].cardtype = page.docs[i].HaiLanMemberInfo ? cardtype[page.docs[i].HaiLanMemberInfo.type]||"" : "";

                    var tags = [];
                    if( page.docs[i].tags){
                        for (var ii=0; ii<page.docs[i].tags.length; ii++)
                        {
                            tags.push('<span class="tm-tag tm-tag-info" ><span>'+page.docs[i].tags[ii]+'</span><a href="javascript:;" class="tm-tag-remove" tagidtoremove="1"  onclick="removeTagOrKeyword(this)">×</a></span>')
                        }
                    }
                    page.docs[i].tags = tags.join("&nbsp;")
                    page.docs[i].followTimebak = page.docs[i].followTime;
                    page.docs[i].followTime = parseInt(((new Date()) - (new Date(page.docs[i].followTime*1000))) / (1000*60*60*24))
                    page.docs[i].registerTime = parseInt(((new Date()) - (new Date(page.docs[i].registerTime))) / (1000*60*60*24))
                    page.docs[i].lastMessageTime = parseInt(((new Date()) - (new Date(page.docs[i].lastMessageTime))) / (1000*60*60*24))
                    page.docs[i].viewCount = page.docs[i].viewCount && otherData.totalView ? (page.docs[i].viewCount) + " <span style='color: #1ABC9C'>" + (parseInt((page.docs[i].viewCount / otherData.totalView)*100)) + "%</span>" : "0";

                    var viewFriendCount = page.docs[i].viewFriendCount + page.docs[i].viewTimeLineCount;

                    page.docs[i].viewFriendCount = viewFriendCount && otherData.totalViewFriend ? (viewFriendCount) + " <span style='color: #1ABC9C'>" + (parseInt((viewFriendCount / otherData.totalViewFriend)*100)) + "%</span>" : "0";
                    var viewShareCount = page.docs[i].shareFriendCount + page.docs[i].shareTimeLineCount;

                    page.docs[i].shareFriendCount = viewShareCount && otherData.totalShare ? (viewShareCount) + " <span style='color: #1ABC9C'>" + (parseInt((viewShareCount / otherData.totalShare)*100)) + "%</span>" : "0";
                    _rows.push(page.docs[i])

                    page.docs[i].unfollowTimeForFollow = page.docs[i].isFollow == false ? parseInt((page.docs[i].unfollowTime - (page.docs[i].followTimebak*1000)) / (1000*60*60*24)) : ''
                    page.docs[i].unfollowTimeForReg = page.docs[i].registerTime ? parseInt((page.docs[i].unfollowTime - (page.docs[i].registerTime)) / (1000*60*60*24)) : ''
                }
                _data.rows = _rows;
            })) ;

        })



        this.step(function(){

            var data = JSON.stringify(_data);
            this.res.writeHead(200, { 'Content-Type': 'application/json' });
            this.res.write(data);
            this.res.end();
        })

    }

    welabUserlist.children.page.view = "lavico/templates/welab/user/listPage.html";

    //筛选导出
    welabUserlist.actions.fexports = {process:
        function(seed,nut){

            nut.disabled = true ;
            var conditions = search.conditions(seed)
            if(conditions && conditions.$or && conditions.$or[0] && conditions.$or[0].followTime){
                conditions.$or[0].followTime.$gt = parseInt(conditions.$or[0].followTime.$gt/1000);
                conditions.$or[0].followTime.$lt = parseInt(conditions.$or[0].followTime.$lt/1000);
            }

            if(conditions && conditions.$and && conditions.$and[0] && conditions.$and[0].followTime){
                conditions.$and[0].followTime.$gt = parseInt(conditions.$and[0].followTime.$gt/1000);
                conditions.$and[0].followTime.$lt = parseInt(conditions.$and[0].followTime.$lt/1000);
            }

            //年龄 任意
            if(conditions && conditions.$or && conditions.$or[0] && conditions.$or[0].birthday){
                if(conditions.$or[0].birthday.$gt){
                    conditions.$or[0].birthday.$gt =new Date((parseInt(new Date().getFullYear()-parseInt(conditions.$or[0].birthday.$gt)))+"-12-31 23:59:59").getTime();
                }else if(conditions.$or[0].birthday.$lt){
                    conditions.$or[0].birthday.$lt =new Date((parseInt(new Date().getFullYear()-parseInt(conditions.$or[0].birthday.$lt)))+"-01-01 00:00:00").getTime();
                }else if(conditions.$or[0].birthday.$lte){
                    conditions.$or[0].birthday.$lte =new Date((parseInt(new Date().getFullYear()-parseInt(conditions.$or[0].birthday.$lte)))+"-12-31 23:59:59").getTime();
                }else if(conditions.$or[0].birthday.$gte){
                    conditions.$or[0].birthday.$gte =new Date((parseInt(new Date().getFullYear()-parseInt(conditions.$or[0].birthday.$gte)))+"-01-01 00:00:00").getTime();
                }else{
                    var gt = new Date((parseInt(new Date().getFullYear()-parseInt(conditions.$or[0].birthday)))+"-01-01 00:00:00").getTime();
                    var lt = new Date((parseInt(new Date().getFullYear()-parseInt(conditions.$or[0].birthday)))+"-12-31 23:59:59").getTime();
                    var investigation  = {$gte:gt,$lte:lt};
                    conditions.$or[0].birthday=investigation;
                }
            }
            //年龄 全部
            if(conditions && conditions.$and && conditions.$and[0] && conditions.$and[0].birthday){
                if(conditions.$and[0].birthday.$gt){
                    conditions.$and[0].birthday.$gt =new Date((parseInt(new Date().getFullYear()-parseInt(conditions.$and[0].birthday.$gt)))+"-12-31 23:59:59").getTime();
                }else if(conditions.$and[0].birthday.$lt){
                    conditions.$and[0].birthday.$lt =new Date((parseInt(new Date().getFullYear()-parseInt(conditions.$and[0].birthday.$lt)))+"-01-01 00:00:00").getTime();
                }else if(conditions.$and[0].birthday.$lte){
                    conditions.$and[0].birthday.$lte =new Date((parseInt(new Date().getFullYear()-parseInt(conditions.$and[0].birthday.$lte)))+"-12-31 23:59:59").getTime();
                }else if(conditions.$and[0].birthday.$gte){
                    conditions.$and[0].birthday.$gte =new Date((parseInt(new Date().getFullYear()-parseInt(conditions.$and[0].birthday.$gte)))+"-01-01 00:00:00").getTime();
                }else{
                    var gt = new Date((parseInt(new Date().getFullYear()-parseInt(conditions.$and[0].birthday)))+"-01-01 00:00:00").getTime();
                    var lt = new Date((parseInt(new Date().getFullYear()-parseInt(conditions.$and[0].birthday)))+"-12-31 23:59:59").getTime();
                    var investigation  = {$gte:gt,$lte:lt};
                    conditions.$and[0].birthday = investigation;
                }
            }
            var doc=[];
            var resultList=[];
            this.step(function(){
                helper.db.coll("welab/customers").find(conditions).toArray(this.hold(function(err,docs){
                    if(err) throw err;
                    if(docs){
                        doc = docs || {};
                    }
                }))
            })

            this.step(function(){
                for(var i=0;i<doc.length;i++){
                    var result={};
                    result.nickname = doc[i].nickname || "--";
                    result.realname = doc[i].realname || "--";
                    result.gender = doc[i].gender == 'female'?"女": (doc[i].gender == 'male' ? "男" : '--');
                    result.birthday = doc[i].birthday ? parseInt(new Date().getFullYear()-parseInt(new Date(doc[i].birthday).getFullYear())):"--"
                    result.mobile = doc[i].mobile || "--";
                    result.profession = doc[i].profession || "--";
                    result.email = doc[i].email || "--";
                    result.province = doc[i].province || "--";
                    result.city = doc[i].city || "--";
                    result.address = doc[i].address || "--";

                    if(doc[i].HaiLanMemberInfo && doc[i].HaiLanMemberInfo.type){
                        if(doc[i].HaiLanMemberInfo.type == 1){
                            doc[i].cardtype = '白卡';
                        }else if(doc[i].HaiLanMemberInfo.type == 2){
                            doc[i].cardtype = 'VIP卡';
                        }else if(doc[i].HaiLanMemberInfo.type == 3){
                            doc[i].cardtype = '白金VIP卡';
                        }else{
                            doc[i].cardtype = '未知';
                        }
                    }else{
                        doc[i].cardtype = '--';
                    }
                    result.cardtype = doc[i].cardtype;

                    if(doc[i].HaiLanMemberInfo && doc[i].HaiLanMemberInfo.cardNumber){
                        doc[i].cardNumber = doc[i].HaiLanMemberInfo.cardNumber;
                    }else{
                        doc[i].cardNumber = '--';
                    }
                    result.cardNumber = doc[i].cardNumber;

                    if(doc[i].HaiLanMemberInfo && doc[i].HaiLanMemberInfo.favoriteStyle){
                        doc[i].favoriteStyle = doc[i].HaiLanMemberInfo.favoriteStyle;
                    }else{
                        doc[i].favoriteStyle = '--';
                    }
                    result.favoriteStyle = doc[i].favoriteStyle;

                    if(doc[i].HaiLanMemberInfo && doc[i].HaiLanMemberInfo.memberID){
                        doc[i].memberID = doc[i].HaiLanMemberInfo.memberID;
                    }else{
                        doc[i].memberID = '--';
                    }
                    result.memberID = doc[i].memberID;

                    if(doc[i].HaiLanMemberInfo && doc[i].HaiLanMemberInfo.favoriteColor){
                        doc[i].favoriteColor = doc[i].HaiLanMemberInfo.favoriteColor;
                    }else{
                        doc[i].favoriteColor = '--';
                    }
                    result.favoriteColor = doc[i].favoriteColor;

                    var tags = [];
                    if(doc[i].tags){
                        for (var j=0; j<doc[i].tags.length; j++)
                        {
                            tags.push(doc[i].tags[j]);
                        }
                        doc[i].tags = tags.join(",");
                    }else{
                        doc[i].tags = '--';
                    }
                    result.tags = tags;

                    result.source = doc[i].source || '--';
                    resultList.push(result);
                }
            })

            this.step(function(){
                var nodeExcel = require('excel-export');
                var conf = {};
                conf.cols = [
                    {
                        caption: '昵称',
                        type: 'string'
                    }, {
                        caption: '姓名',
                        type: 'string'
                    }, {
                        caption: '性别',
                        type: 'string'
                    }, {
                        caption: '年龄',
                        type: 'string'
                    }, {
                        caption: '手机',
                        type: 'string'
                    }, {
                        caption: '行业',
                        type: 'string'
                    }, {
                        caption: 'Email',
                        type: 'string'
                    }, {
                        caption: '省份',
                        type: 'string'
                    }, {
                        caption: '城市',
                        type: 'string'
                    }, {
                        caption: '具体地址',
                        type: 'string'
                    }, {
                        caption: '喜好款式',
                        type: 'string'
                    }, {
                        caption: '喜好颜色',
                        type: 'string'
                    }, {
                        caption: '卡类型',
                        type: 'string'
                    }, {
                        caption: '卡号码',
                        type: 'string'
                    }, {
                        caption: '会员号码',
                        type: 'string'
                    }, {
                        caption: '关注来源',
                        type: 'string'
                    }, {
                        caption: '标签',
                        type: 'string'
                    }

                ];
                conf.rows = [];
                for(var i=0 ;i < resultList.length;i++){
                    var rows;
                    rows = [
                        resultList[i].nickname,
                        resultList[i].realname,
                        resultList[i].gender,
                        resultList[i].birthday,
                        resultList[i].mobile,
                        resultList[i].profession,
                        resultList[i].email,
                        resultList[i].province,
                        resultList[i].city,
                        resultList[i].address,
                        resultList[i].favoriteStyle,
                        resultList[i].favoriteColor,
                        resultList[i].cardtype,
                        resultList[i].cardNumber,
                        resultList[i].memberID,
                        resultList[i].source,
                        resultList[i].tags
                    ]
                    conf.rows.push(rows)
                }

                var result = nodeExcel.execute(conf);
                this.res.setHeader('Content-Type', 'application/vnd.openxmlformats');
                this.res.setHeader("Content-Disposition", "attachment; filename=Report.xlsx");
                this.res.write(result, 'binary');
                this.res.end();
            })
        }
    }

    welabUserlist.children.page.viewIn = function(){
        $("#userList").flexigrid({
            url: '/welab/user/list:jsonData',
            dataType: 'json',
            colModel : [
                {display: '<input type="checkbox" onclick="selectAllUser(this)">', name : 'input', width : 30, sortable : true},
                {display: '昵称', name : 'nickname', width : 95, sortable : true},
                {display: '姓名', name : 'realname', width : 95, sortable : true},
                {display: '性别', name : 'gender', width : 40, sortable : true},
                {display: '年龄', name : 'birthday', width : 40, sortable : true},
                {display: '城市', name : 'city', width : 90, sortable : true},
                {display: '行业', name : 'industry', width : 90, sortable : true},
                {display: '卡类型', name : 'cardtype', width : 90, sortable : true},
                {display: '关注来源', name : 'source', width : 90, sortable : true},
                {display: '标签', name : 'tags', width : 200, sortable : true},


                {display: '已关注(天)', name : 'followTime', width : 70, sortable : true, hide:true},
                {display: '已注册(天)', name : 'registerTime', width : 70, sortable : true, hide:true},
                {display: '未会话(天)', name : 'lastMessageTime', width : 70, sortable : true, hide:true},
                {display: '会话数(占比)', name : 'messageCount', width : 100, sortable : true, hide:true},
                {display: '注册', name : 'isRegister', width : 40, sortable : true, hide:true},
                {display: '自己浏览(占比)', name : 'viewCount', width : 90, sortable : true, hide:true},
                {display: '分享(占比)', name : 'shareFriendCount', width : 90, sortable : true, hide:true},
                {display: '好友浏览(占比)', name : 'viewFriendCount', width : 90, sortable : true, hide:true},
                {display: '关注次数', name : 'followCount', width : 80, sortable : true, hide:true},
                {display: '取消关注距关注(天)', name : 'unfollowTimeForFollow', width : 120, hide:true},
                {display: '取消关注距注册(天)', name : 'unfollowTimeForReg', width : 120, hide:true}
            ],
            //sortname: "input",
            sortorder: "desc",
            usepager: true,
            useRp: true,
            rp: 17,
            showTableToggleBtn: true,
            width: 930,
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


        /**
         * 设置标签
         */
        $(".userTagBtn").on("click",function(){

            var tags = $("#tag option:selected").val();
            if( tags == "-1"){
                $.globalMessenger().post({
                    message: '请选择一个标签.',
                    type: 'error',
                    showCloseButton: true})
                return ;
            }

            var oUserSetOption = {} ;
            oUserSetOption.data = [];
            oUserSetOption.data.push({name:"sUserList",value:getUserList().join(",")});
            oUserSetOption.data.push({name:"sTagList",value:tags});
            oUserSetOption.type = "POST";
            oUserSetOption.url = "/welab/user/tags:setUserTag";

            $.request(oUserSetOption,function(err,nut){
                if(err) throw err ;
                nut.msgqueue.popup() ;
                // 更改页面数据
                var jsonData = nut.model.jsonData;
//                console.log("jsonData",jsonData)
                if(jsonData.length==0){
                    return;
                }

                $("#userList").find("tr").each(function( i, o){
                    var tds = $(o).find("td");
                    if(tds.eq(0).find("input")[0].checked){

                        for(var i=0;i<jsonData.length;i++){
                            if(jsonData[i].id == tds.eq(0).find("input")[0].id && jsonData[i].status==true){
                                var aOldTagsList = [];
                                tds.eq(9).find("span").each(function(i,o){
                                    aOldTagsList.push($(o).find("span").text());
                                })
                                var tags = $("#tag option:selected").val();
//                                var tags = $("input[type='hidden'][name='tagsVal']").val();
//                                var aNewTagsList = tags.split(",");

                                var _is = false;
                                //for (var iii=0; iii<aNewTagsList.length; iii++){
                                    _is = false;
                                    if(jsonData[i].tag == tags){
                                        for (var ii=0; ii<aOldTagsList.length; ii++){
                                            if( aOldTagsList[ii].toLowerCase() == tags.toLowerCase()){
                                                _is = true;
                                                break;
                                            }
                                        }
                                        if( _is == false){

                                            var _span = '<span class="tm-tag tm-tag-info" ><span>'+tags+'</span><a href="javascript:;" class="tm-tag-remove"  onclick="removeTagOrKeyword(this)">×</a></span>';
                                            tds.eq(9).find("div").append(_span);
                                        }
                                    }
                               // }
                            }
                        }
                    }
                })
            }) ;

            $('#tagModal').modal('toggle');
            return false;

        });


        /**
         * 消息
         */
        $(".sendMessageBtn").on("click",function(){

            var oUserSetOption = {} ;
            oUserSetOption.data = [];
            oUserSetOption.data.push({name:"sUserList",value:getUserList().join(",")});
            oUserSetOption.data.push({name:"sContent",value:$("#sendMessageValue").val()});
            oUserSetOption.type = "POST";
            oUserSetOption.url = "/welab/user/form:sendMessage";

            $.request(oUserSetOption,function(err,nut){
                if(err) throw err ;
                $("#sendMessageValue").val("")
                nut.msgqueue.popup() ;

            }) ;

            $('#sendMessageModal').modal('toggle');
            return false;

        });
    }

    //json复写list-viewIn
    welabUserlist.viewIn=function(){
//        jQuery("#tags").tagsManager({
//            prefilled: [],
//            hiddenTagListName: 'tagsVal'
//        });
        // search box--搜索显示
        $.searchInitConditions([
            {field:'realname',title:'姓名',type:'text'}
            , {field:'gender',title:'性别',type:'gender'}
            , {field:'birthday',title:'年龄',type:'birthday'}
            , {field:'email',title:'电子邮件',type:'text'}
            , {field:'mobile',title:'移动电话',type:'text'}
            , {field:'registerTime',title:'注册时间',type:'date'}
            , {field:'followTime',title:'关注时间',type:'date'}
            , {field:'tags',title:'标签',type:'text'}
            , {field:'nickname',title:'昵称',type:'text'}
            , {field:'city',title:'城市',type:'text'}
            , {field:'profession',title:'行业',type:'text'}
            , {field:'source',title:'关注来源',type:'value'}
            , {field:'HaiLanMemberInfo.action',title:'绑定',type:'member'}
            , {field:'HaiLanMemberInfo.type',title:'会员卡',type:'membertype'}
            , {field:'isFollow',title:'关注',type:'follow'}
            , {field:'isRegister',title:'注册',type:'register'}
        ]) ;

        $(".btnsearch").click(function(){
            var conditions = $(this).searchConditions() ;
            if(!conditions.length)
                return ;


            //{params:[{name:"conditions",value:[["city","上海"]]},{name:"logic",value:"任意"}]}
            $("#userList").flexOptions({params: [{name:"conditions",value:JSON.stringify(conditions)},{name:"logic",value:$("[name=searchLogic]").val()}]});
            $('#userList').flexOptions({newp: 1}).flexReload();

            /*
             $.controller("/welab/user/list:page",{
             conditions:JSON.stringify(conditions)
             , logic: $("[name=searchLogic]").val()
             },'.childview>.ocview') ;*/
        }) ;

        //取消筛选
        $(".btncancel").click(function(){

            $('#searchView').fadeOut('100')
            $('.searchConditionOuter').empty()
            $.controller("/welab/user/list:page",{
                conditions:JSON.stringify({})
                , logic: $("[name=searchLogic]").val()
            },'.childview>.ocview') ;
        }) ;

        /**
         * 设置标签
         */
        $(".userSetTagView").on("click",function(){

            var aList = getUserList();
            if( aList.length == 0){
                $.globalMessenger().post({
                    message: '至少选择一个用户.',
                    type: 'error',
                    showCloseButton: true})
                return ;
            }

            //jQuery("#tags").tagsManager('empty');

            $('#tagModal').modal('toggle');
            oUserSetOption = {} ;
            oUserSetOption.data = [];
            oUserSetOption.data.push({name:"sUserList",value:aList.join(",")});
            return false;
        })

        /**
         * 删除动作
         */
        var deletingLink ;
        $(".removeUserView").on("click",function(){

            $('#delModal').modal('toggle');
            deletingLink = this ;
            deletingLink.href += "?userList=";
            var aUserList = [];
            $("#userList").find("tr").each(function(i,o){

                var _oInput = jQuery(o).find("td:eq(0)").find("input")

                var _uid = _oInput.attr("userid");

                if( _uid && _oInput[0].checked){
                    aUserList.push(_uid);
                }

            })

            deletingLink.href += aUserList.join(",");
            return false;
        })

        $(".removeUserBtn").click(function(){

            $('#delModal').modal('toggle');

            $(deletingLink).action(function(err,nut){
                if(err) throw err ;
                nut.msgqueue.popup() ;
                $.controller("/welab/user/list",null,"lazy");

            }) ;

            return false;
        });

        /**
         * 发送短信
         */
//        jQuery("#tags").tagsManager({
//            prefilled: [],
//            hiddenTagListName: 'tagsVal'
//        });
        $(".sendSMS").on("click",function(){

            var sms = getUserList();
            if(sms.length == 0){
                $.globalMessenger().post({
                    message: '至少选择一个用户.',
                    type: 'error',
                    showCloseButton: true})
                return ;
            }
            jQuery("#tags").tagsManager('empty');
            $('#sendMessageModal').modal('toggle');
            oUserSetOption = {} ;
            oUserSetOption.data = [];
            oUserSetOption.data.push({name:"sUserList",value:sms.join(",")});
            return false;
        })


        /**
         * 分页导出
         */
        $(".exports").on("click",function(){

            var aList = getUserList();
            if( aList.length == 0){
                $.globalMessenger().post({
                    message: '至少选择一条数据',
                    type: 'error',
                    showCloseButton: true})
                return ;
            }else{
                window.location.href="/welab/user/list:exports?UserList="+getUserList().join(",");
                return false;
            }
            return false;
        })
    }

    //复写 view
    welabUserlist.view = "lavico/templates/welab/user/list.html"


    var welabMessagelist = require("welab/controllers/MessageList.js");

    welabMessagelist.view = "lavico/templates/welab/message/MessageList.html";

    welabMessagelist.process = function(seed,nut){
        this.step(function(){
            helper.db.coll("lavico/tags").find({}).toArray(this.hold(function(err,docs){
                if(err) throw  err;
                nut.model.taglist = docs || {};
            }))
        })
    }

    welabMessagelist.viewIn = function(){
        // search box--搜索显示
        $.searchInitConditions([
            {field:'realname',title:'姓名',type:'text'}
            , {field:'gender',title:'性别',type:'gender'}
            , {field:'birthday',title:'年龄',type:'birthday'}
            , {field:'email',title:'电子邮件',type:'text'}
            , {field:'mobile',title:'移动电话',type:'text'}
            , {field:'registerTime',title:'注册时间',type:'date'}
            , {field:'followTime',title:'关注时间',type:'date'}
            , {field:'tags',title:'标签',type:'text'}
            , {field:'nickname',title:'昵称',type:'text'}
            , {field:'city',title:'城市',type:'text'}
            , {field:'profession',title:'行业',type:'text'}
            , {field:'source',title:'关注来源',type:'value'}
            , {field:'HaiLanMemberInfo.action',title:'绑定',type:'member'}
            , {field:'HaiLanMemberInfo.type',title:'会员卡',type:'membertype'}
            , {field:'isFollow',title:'关注',type:'follow'}
            , {field:'isRegister',title:'注册',type:'register'}
            , {field:'message.type',title:'消息类型',type:'type'}
            , {field:'message.time',title:'发送时间',type:'date'}
        ]) ;

//        jQuery("#tags").tagsManager({
//            prefilled: [],
//            hiddenTagListName: 'tagsVal'
//        });


        /**
         * 设置标签
         */
        $(".userSetTagView").on("click",function(){

            var aList = getUserList();
            if( aList.length == 0){
                $.globalMessenger().post({
                    message: '至少选择一个用户.',
                    type: 'error',
                    showCloseButton: true})
                return ;
            }

            //jQuery("#tags").tagsManager('empty');

            $('#tagModal').modal('toggle');
            oUserSetOption = {} ;
            oUserSetOption.data = [];
            oUserSetOption.data.push({name:"sUserList",value:aList.join(",")});
            return false;
        })

        /**
         * 设置标签
         */
        $(".userTagBtn").on("click",function(){

            var tags = $("#tag option:selected").val();
            if( tags == "-1"){
                $.globalMessenger().post({
                    message: '请选择一个标签.',
                    type: 'error',
                    showCloseButton: true})
                return ;
            }

            var oUserSetOption = {} ;
            oUserSetOption.data = [];
            oUserSetOption.data.push({name:"sUserList",value:getUserList().join(",")});
            oUserSetOption.data.push({name:"sTagList",value:tags});
            oUserSetOption.type = "POST";
            oUserSetOption.url = "/welab/user/tags:setUserTag";

            $.request(oUserSetOption,function(err,nut){
                if(err) throw err ;
                nut.msgqueue.popup() ;
            }) ;

            $('#tagModal').modal('toggle');
            return false;

        });



        $(".btnsearch").click(function(){
            var conditions = $(this).searchConditions() ;

            if(!conditions.length)
                return ;

            $.controller("/welab/MessageList:page",{
                conditions:JSON.stringify(conditions)
                , logic: $("[name=searchLogic]").val()
            },'.childview>.ocview') ;
        }) ;

        $(".btncancel").click(function(){

            $('#searchView').fadeOut('100')
            $('.searchConditionOuter').empty()
            $.controller("/welab/MessageList:page",{
                conditions:JSON.stringify({})
                , logic: $("[name=searchLogic]").val()
            },'.childview>.ocview') ;
        }) ;
    }

    welabMessagelist.children.page.process = function(seed,nut){
        var msgTypeNames = {
            text:'文本'
            , image:'图片'
            , location:'位置'
            , link:'链接'
            , voice:'语音'
        } ;

        if(typeof(seed.conditions)== "undefined" || typeof(seed.logic) == "undefined"){
            nut.model.conditions = "null";
            nut.model.logic = "null";
        }else{
            nut.model.conditions = encodeURIComponent(seed.conditions);
            nut.model.logic = encodeURIComponent(seed.logic);
        }
        var conditions = search.conditions(seed);
        if(conditions && conditions.$or && conditions.$or[0] && conditions.$or[0].followTime){
            conditions.$or[0].followTime.$gt = parseInt(conditions.$or[0].followTime.$gt/1000);
            conditions.$or[0].followTime.$lt = parseInt(conditions.$or[0].followTime.$lt/1000);
        }

        if(conditions && conditions.$and && conditions.$and[0] && conditions.$and[0].followTime){
            conditions.$and[0].followTime.$gt = parseInt(conditions.$and[0].followTime.$gt/1000);
            conditions.$and[0].followTime.$lt = parseInt(conditions.$and[0].followTime.$lt/1000);
        }
        //年龄 任意
        if(conditions && conditions.$or && conditions.$or[0] && conditions.$or[0].birthday){
            if(conditions.$or[0].birthday.$gt){
                conditions.$or[0].birthday.$gt =new Date((parseInt(new Date().getFullYear()-parseInt(conditions.$or[0].birthday.$gt)))+"-12-31 23:59:59").getTime();
            }else if(conditions.$or[0].birthday.$lt){
                conditions.$or[0].birthday.$lt =new Date((parseInt(new Date().getFullYear()-parseInt(conditions.$or[0].birthday.$lt)))+"-01-01 00:00:00").getTime();
            }else if(conditions.$or[0].birthday.$lte){
                conditions.$or[0].birthday.$lte =new Date((parseInt(new Date().getFullYear()-parseInt(conditions.$or[0].birthday.$lte)))+"-12-31 23:59:59").getTime();
            }else if(conditions.$or[0].birthday.$gte){
                conditions.$or[0].birthday.$gte =new Date((parseInt(new Date().getFullYear()-parseInt(conditions.$or[0].birthday.$gte)))+"-01-01 00:00:00").getTime();
            }else{
                var gt = new Date((parseInt(new Date().getFullYear()-parseInt(conditions.$or[0].birthday)))+"-01-01 00:00:00").getTime();
                var lt = new Date((parseInt(new Date().getFullYear()-parseInt(conditions.$or[0].birthday)))+"-12-31 23:59:59").getTime();
                var investigation  = {$gte:gt,$lte:lt};
                conditions.$or[0].birthday=investigation;
            }
        }
        //年龄 全部
        if(conditions && conditions.$and && conditions.$and[0] && conditions.$and[0].birthday){
            if(conditions.$and[0].birthday.$gt){
                conditions.$and[0].birthday.$gt =new Date((parseInt(new Date().getFullYear()-parseInt(conditions.$and[0].birthday.$gt)))+"-12-31 23:59:59").getTime();
            }else if(conditions.$and[0].birthday.$lt){
                conditions.$and[0].birthday.$lt =new Date((parseInt(new Date().getFullYear()-parseInt(conditions.$and[0].birthday.$lt)))+"-01-01 00:00:00").getTime();
            }else if(conditions.$and[0].birthday.$lte){
                conditions.$and[0].birthday.$lte =new Date((parseInt(new Date().getFullYear()-parseInt(conditions.$and[0].birthday.$lte)))+"-12-31 23:59:59").getTime();
            }else if(conditions.$and[0].birthday.$gte){
                conditions.$and[0].birthday.$gte =new Date((parseInt(new Date().getFullYear()-parseInt(conditions.$and[0].birthday.$gte)))+"-01-01 00:00:00").getTime();
            }else{
                var gt = new Date((parseInt(new Date().getFullYear()-parseInt(conditions.$and[0].birthday)))+"-01-01 00:00:00").getTime();
                var lt = new Date((parseInt(new Date().getFullYear()-parseInt(conditions.$and[0].birthday)))+"-12-31 23:59:59").getTime();
                var investigation  = {$gte:gt,$lte:lt};
                conditions.$and[0].birthday = investigation;
            }
        }

        var collCus = helper.db.coll("welab/customers") ;
        var collMsg = helper.db.coll("welab/messages") ;
        var collReply = helper.db.coll("welab/reply") ;
        var pg ;

        var messageWhere = {replyFor:null}
        var isok = false;

        // 单独增加消息类型的搜索
        if(conditions && (conditions['$or'])){

            for(var i=0 ; i<conditions['$or'].length ; i++){

                var _where = conditions['$or'][i]
                if(_where['message.type']){
                    messageWhere.type = _where['message.type']
                    isok=true;
                    conditions['$or'].splice(i,1)
                }
            }

            if(conditions['$or'].length == 0){
                delete conditions['$or'];
            }
        }
        if(conditions && (conditions['$and'])){

            for(var i=0 ; i<conditions['$and'].length ; i++){

                var _where = conditions['$and'][i]
                if(_where['message.type']){
                    messageWhere.type = _where['message.type']
                    isok=true;
                    conditions['$and'].splice(i,1)
                }
            }

            if(conditions['$and'].length == 0){
                delete conditions['$and'];
            }
        }

        // 单独增加发送消息时间的搜索
        if(conditions && (conditions['$or'])){

            for(var i=0 ; i<conditions['$or'].length ; i++){

                var _where = conditions['$or'][i]
                if(_where['message.time']){
                    messageWhere.time = _where['message.time']
                    isok=true;
                    conditions['$or'].splice(i,1)
                }
            }

            if(conditions['$or'].length == 0){
                delete conditions['$or'];
            }
        }
        if(conditions && (conditions['$and'])){

            for(var i=0 ; i<conditions['$and'].length ; i++){

                var _where = conditions['$and'][i]
                if(_where['message.time']){
                    messageWhere.time = _where['message.time']
                    isok=true;
                    conditions['$and'].splice(i,1)
                }
            }

            if(conditions['$and'].length == 0){
                delete conditions['$and'];
            }
        }

        var _pageNum;
        if(typeof seed.page == 'undefined'){
            _pageNum = 1;
        }else{
            _pageNum = parseInt(seed.page);
        }

        collMsg.find(messageWhere).sort({time:-1}).page({
            pageNum:_pageNum,
            perPage: 10,
            filter: (conditions == true) && function(doc,cb){

                collCus.findOne({ $and: [{wechatid: doc.from}, conditions] },function(err,docCUS){
                        if(err) console.log(err) ;
                        cb(docCUS?doc:false) ;
                    }
                );
            },
            callback: this.hold(function(err,page){
                if(err) throw err ;
                pg = nut.model.page = page || {} ;

                page.docs && this.each(page.docs,function(idx,msgdoc){

                    // format date/time
                    var _timeOffset = new Date().getTimezoneOffset()
                    var formattime = new Date(msgdoc.time + (-_timeOffset * 60 *1000)).toISOString() ;
                    msgdoc.date = formattime.substr(0,10).replace(/\-/g,'/') ;
                    msgdoc.time = formattime.substr(11,5) ;

                    // msg type name
                    msgdoc.typeName = msgTypeNames[msgdoc.type] || msgdoc.type ;

                    // link to customer
                    collCus.findOne({wechatid:msgdoc.from}, this.hold(function(err,cusdoc){
                            if(err) throw err ;

                            if(cusdoc){
                                cusdoc.realname = '<a href="/welab/user/detail?_id='+cusdoc._id+'" class="stay-top">'+ (cusdoc.realname || '--') +'</a>'         ;
                                cusdoc.nickname = '<a href="/welab/user/detail?_id='+cusdoc._id+'" class="stay-top">'+ (cusdoc.nickname || '--') +'</a>'         ;
                                cusdoc.city = cusdoc.city || '';
                                cusdoc.gender = cusdoc.gender == 'female'?"女": (cusdoc.gender == 'male' ? "男" : '--')
                                cusdoc.birthday = cusdoc.birthday ? parseInt(new Date().getFullYear()-parseInt(new Date(cusdoc.birthday).getFullYear())):"--"

                                cusdoc.source = cusdoc.source || '--';
                                cusdoc.cardtype = cusdoc.cardtype || '微信会员卡';
                                cusdoc.industry = cusdoc.industry || '--';
                            }

                            msgdoc.customer = cusdoc || {} ;
                        })
                    ) ;

                    // link to reply
                    collMsg.findOne({reply: msgdoc._id}, this.hold(function(err,rmsgdoc){
                            if(err) throw err ;

                            if(!rmsgdoc)
                                return ;

                            // matched keywords
                            msgdoc.matchedKeywords = rmsgdoc.matchedKeywords ;

                            collReply.findOne({_id: rmsgdoc.content}, this.hold(function(err,replydoc){
                                    if(err) throw err ;
                                    msgdoc.reply = replydoc ;
                                })
                            ) ;
                        })
                    ) ;
                }) ;
            })
        }) ;


        this.step(function(){
//            console.log("pg",pg)
        }) ;
    }

    // 复写 messageList
    welabMessagelist.children.page.view = "lavico/templates/MessageListPage.html";


    var welabUserform= require("welab/controllers/user/form.js");
    //短信发送
    welabUserform.actions.sendMessage = function(seed,nut){
        nut.view.disable() ;
        var sUserList = seed.sUserList.split(",");
        var aValue = seed.sContent;
        var errID = [];
        var successID = [];
        var mobile;
        var wxid;
        var memberid;
        var count = sUserList.length;
        for(var i = 0 ; i < sUserList.length ; i++){
            (function(userdoc,then){
                helper.db.coll("welab/customers").findOne({_id : helper.db.id(userdoc)},then.hold(function(err,doc){
//                    console.log(doc.mobile)
                    if(doc.mobile){
                        mobile = doc.mobile;
                        memberid=doc.HaiLanMemberInfo.memberID;
                        wxid = doc.wechatid;
//                        console.log(doc.mobile)
                        try{
                            middleware.request( "System/SendSMS",{'mobile':doc.mobile,'content':"【LaVico朗维高】:"+aValue},this.hold(function(err,doc){
                                helper.db.coll("welab/SMS").insert({"wxid":wxid,"memberID":memberid,"mobile":mobile,"content":"【LaVico朗维高】:"+aValue,"createTime":new Date().getTime()},function(err,docs){
                                    if(err) throw err;
                                })
                            })
                            );
                        }catch (err){
                            console.log(err)
                        }

                        successID.push(doc.mobile)
                    }else{
                        errID.push(doc.mobile)
                    }
                }))
            })(sUserList[i],this)
        }
        this.step(function(){
            if( errID.length == 0){
                helper.db.coll("welab/SMScount").insert({"success":successID.length,"failure":errID.length,"total":count,"createTime":new Date().getTime()},function(err,docs){
                    if(err) throw err;
                })
                nut.message("发送成功",null,"success") ;
            }else{
                helper.db.coll("welab/SMScount").insert({"success":successID.length,"failure":errID.length,"total":count,"createTime":new Date().getTime()},function(err,docs){
                    if(err) throw err;
                })
                nut.message(successID.length+"个用户发送成功;" + errID.length+"个失败",null,"error") ;
            }
        })

    }

    //删除标签
    welabUserform.actions.removeTag = function(seed,nut){
        nut.view.disable() ;
        var _id = seed._id;
        var tag = seed.name;
        var memberId;
        var status = 0;// 0:成功 1:失败
        this.step(function(){
            if(_id){
                helper.db.coll("welab/customers").findOne({"_id":helper.db.id(_id)},this.hold(function(err,doc){
                    if(err) throw err;
                    if(doc && doc.HaiLanMemberInfo){
                        memberId = doc.HaiLanMemberInfo.memberID;
                    }else{
                        status = 1;
                    }
                }))
            }else{
                status = 1;
            }
        })

        this.step(function(){
            if(status==0 && memberId && tag){
                middleware.request("Tag/Remove", {memberId: memberId,tag:tag}, this.hold(function (err, doc) {
                    if(err) {
                        console.log(err)
                    }
                    if(doc){
                        var docs = JSON.parse(doc);
//                        console.log("docs",docs)
                        if(docs.success){
                            status = 0;
                        }else{
                            status = 1;
                        }
                    }else{
                        status = 1;
                    }
                }))
            }else{
                status = 1;
            }
        })

        this.step(function(){
            if(status == 0){
                helper.db.coll("welab/customers").update({_id : helper.db.id(_id)}, {"$pull":{tags:tag}},this.hold(function(err,doc){
                    if(err){
                        throw err;
                    }
//                    console.log("doc",doc)
                    if(doc){
                        status = 0;
                    }else{
                        status = 1;
                    }
                }))
            }
            nut.model.status = status;
//            console.log("nut.model.status",nut.model.status)
            if(status == 0){
                nut.message("删除成功",null,"success");
            }else{
                nut.message("删除失败",null,"error");
            }
        })
    }



    // 复写 welab/user/detail by David.xu 2014-05-29 Start
    var welabUserDetail = require("welab/controllers/user/detail.js");



    welabUserDetail.view = "lavico/templates/welab/user/detail.html";
    welabUserDetail.process = function(seed,nut){


        this.step(function(){
            helper.db.coll("lavico/tags").find({}).toArray(this.hold(function(err,docs){
                if(err) throw err;
                nut.model.taglist = docs || {};
            }))
        })

        helper.db.coll("welab/customers").findOne({_id : helper.db.id(seed._id)},this.hold(function(err,doc){

            var _data = {};
            _data = doc;

            summary.otherData(seed._id , this.hold(function(doc){
                _data.otherData = doc;

                _data.regData = {}
                for(var _tmp in _data){
                    if( _tmp != "_id" && _tmp != "city" && _tmp != "country" && _tmp != "face" && _tmp != "fakeid" && _tmp != "followCount" && _tmp != "followTime" && _tmp != "gender" && _tmp != "isFollow" && _tmp != "lastMessageTime" && _tmp != "messageCount" && _tmp != "province" && _tmp != "ranking" && _tmp != "realname" && _tmp != "wechatUsername" && _tmp != "wechatid" && _tmp != "otherData" && _tmp!="regData" && _tmp!="birthday" && _tmp!="mobile" && _tmp!="tags" && _tmp!="email" && _tmp!="registerTime" && _tmp!="telephone" && _tmp!="unfollowCount" && _tmp!="unfollowTime"  && _tmp!="shareFriendCount" && _tmp!="shareTimeLineCount" && _tmp!="viewCount" && _tmp!="viewTimeLineCount"){
                        _data.regData[_tmp] = _data[_tmp]
                    }
                }

                if(_data.face && !/^http:\/\//g.test(_data.face) && !/^\/welab\//g.test(_data.face)){
                    _data.face = "/welab/" + _data.face
                }

//                console.log(_data)


                nut.model.data = _data||{};

                if(_data.HaiLanMemberInfo&&_data.HaiLanMemberInfo.memberID){
                    nut.model.data.memberID = _data.HaiLanMemberInfo.memberID;
                }

                if(_data.HaiLanMemberInfo&&_data.HaiLanMemberInfo.cardNumber){
                    nut.model.data.cardNumber = _data.HaiLanMemberInfo.cardNumber;
                }

                if(_data.HaiLanMemberInfo&&_data.HaiLanMemberInfo.action){
                    if(_data.HaiLanMemberInfo.action == 'bind'){
                        nut.model.data.action = '绑定';
                    }else{
                        nut.model.data.action = '未绑定';
                    }
                }

                if(_data.HaiLanMemberInfo&&_data.HaiLanMemberInfo.type){
                    if(_data.HaiLanMemberInfo.type == 1){
                        nut.model.data.type = '白卡';
                    }else if(_data.HaiLanMemberInfo.type == 2){
                        nut.model.data.type = 'VIP卡';
                    }else if(_data.HaiLanMemberInfo.type == 3){
                        nut.model.data.type = '白金VIP卡';
                    }else{
                        nut.model.data.type = '未知';
                    }
                }
            }));
        }));


    };

    welabUserDetail.viewIn = function(seed,nut){

//        jQuery("#tags").tagsManager({
//            prefilled: [],
//            hiddenTagListName: 'tagsVal'
//        });


        $('#datetimepicker').datetimepicker({
            format: 'yyyy-mm-dd',
            autoclose: true,
            minView: 2
        }).on('changeDate', function(ev)
            {
                $("#datetimepicker").attr("utime",ev.date.valueOf())
            });


        /**
         * 删除动作
         */
        var deletingLink ;
        $(".removeUserView").on("click",function(){
            deletingLink = this ;
            $('#delModal').modal('toggle');
            return false;
        })

        $(".removeUserBtn").click(function(){
            $('#delModal').modal('toggle');
            $(deletingLink).action(function(err,nut){
                if(err) throw err ;
                nut.msgqueue.popup() ;
                $.controller("/welab/user/list",null,"lazy");
            }) ;
            return false;
        });

        /**
         * 设置标签
         */
        var oUserSetOption = {} ;

        $(".userSetTagView").on("click",function(){
            //jQuery("#tags").tagsManager('empty');
            $('#tagModal').modal('toggle');
            oUserSetOption = {} ;
            oUserSetOption.data = [];
            oUserSetOption.data.push({name:"sUserList",value:$("#_id").text()});
            return false;
        })

        $(".userTagBtn").click(function(){

            var tags = $("#tag option:selected").val();
            if( tags == "-1"){
                $.globalMessenger().post({
                    message: '请选择一个标签.',
                    type: 'error',
                    showCloseButton: true})
                return ;
            }
            oUserSetOption.data.push({name:"sTagList",value:tags});
            oUserSetOption.type = "POST";
            oUserSetOption.url = "/welab/user/tags:setUserTag";
            $('#tagModal').modal('toggle');

            $.request(oUserSetOption,function(err,nut){
                if(err) throw err ;
                nut.msgqueue.popup() ;
                $.controller("/welab/user/detail?_id="+$("#_id").text(),null,"lazy");
            }) ;

            return false;

        });

        pro=document.getElementById("provid");
        for(var key in selects){
            pro.options.add(new Option(key,key));
        }
    }

    // 复写 welab/user/detail by David.xu 2014-05-29 End


    var welabUserTags = require("welab/controllers/user/tags.js");
    welabUserTags.actions.setUserTag.process = function(seed,nut){
        nut.view.disable() ;
        nut.model.page = {} ;

        var aTagList = seed.sTagList;
        var aUserList = seed.sUserList.split(",");
        var errID = [];
        var successID = [];
        var then = this;
        var jsonData=[];
        var stutas=[];
        var jsontag=[];
        var cuid

        this.step(function(){
            if( seed.sUserList == "" ){
                nut.message("没有指定要操作的ID",null,"error") ;
                return false;
            }
            //for(var i=0;i<aTagList.length;i++){
               // var tag = aTagList[i];
                //(function(i,tag){
                    for(var j=0;j<aUserList.length;j++){
                        (function(j,jsonData){
                            var id= aUserList[j]
                            helper.db.coll("welab/customers").findOne({"_id":helper.db.id(aUserList[j])},then.hold(function(err,doc){
                                if(err) throw err;
                                if(doc){
                                    if(doc.HaiLanMemberInfo){
                                        json={};
                                        json.memberId = doc.HaiLanMemberInfo.memberID;
                                        json.tag = aTagList;
                                        json.id= id;
                                        jsonData.push(json);
                                    }else{
                                        sta={};
                                        sta.stat = false;
                                        sta.id = id;
                                        stutas.push(sta)
                                    }
                                }
                            }))
                        })(j,jsonData)
                    }
                //})(i,tag)
            //}
        })

        this.step(function(){

            this.each(jsonData,function(i,row){

                if(row.memberId){

                    middleware.request("Tag/Add", {memberId: row.memberId,tag: row.tag}, this.hold(function (err, doc) {
                        if (err) {
                            console.log(err)
                        }else{
                            console.log(doc)
                        }
                        var docs = JSON.parse(doc);
                        row.status = docs.success;
                        sta={};
                        sta.stat = docs.success;
                        sta.id = row.id;
                        stutas.push(sta);
                    }))
                }
            })
        })

        this.step(function(){
//            console.log("stutas",stutas)
            //for (var i=0; i<aTagList.length; i++) {
                //tag = aTagList[i];
                for(var j=0;j<stutas.length;j++){
                    if(stutas[j].stat==true){

                        helper.db.coll("welab/customers").update({_id : helper.db.id(stutas[j].id)}, {$addToSet:{tags:aTagList}},then.hold(function(err,doc){
                            if(err ){
                                throw err;
                            }
                        }))
                    }
                }
            //}
        });

        this.step(function(){
//            console.log("stutas.length",stutas.length)
            for(var j=0;j<stutas.length;j++){
                if(stutas[j].stat==false){
                    errID.push(stutas[j].id);
                }else{
                    successID.push(stutas[j].id);
                }
            }
        })

        this.step(function(){
            nut.model.jsonData = jsonData;
//            console.log("jsonData",jsonData)
//            console.log(errID.length)
//            console.log(successID.length)
            if(errID.length==0){
                nut.message("操作完成",null,"success");
            }else{
                nut.message("共为"+aUserList.length+"个用户设定标签,"+successID.length+"个标签设定成功,"+ errID.length+"个标签设定失败(不是会员或标签重复)",null,"error") ;
            }
        })
    }

    //复写 reply/detail.js
    var welabReplyDetail = require("welab/controllers/reply/detail.js");
    welabReplyDetail.view = "lavico/templates/welab/reply/detail.html"

    var welabAppsMenuStatics = require("welab/apps/menu/controllers/statistics");
    welabAppsMenuStatics.process  = function(seed,nut){
        var then = this
        var menus = {}

        var count=0;

        nut.model.seed = seed;

        var dTime = new Date()
        var _ym = dTime.getFullYear() + "-" + (dTime.getMonth()+1)

        var startTimeStamp = seed.startDate ? new Date(seed.startDate + " 00:00:00").getTime() : new Date(_ym+"-01 00:00:00").getTime();
        var endTimeStamp = seed.stopDate ? new Date(seed.stopDate + " 23:59:59").getTime() : new Date(_ym+"-31 23:59:59").getTime();
        nut.model.startDate = new Date(startTimeStamp+60*60*8*1000).toISOString().substr(0,10)
        nut.model.stopDate = new Date(endTimeStamp+60*60*8*1000).toISOString().substr(0,10)

        // menu list
        helper.db.coll("welab/settings").findOne({_id:"wechat.menus"},this.hold(function(err,docs){
            if(err) throw err ;
            menus = docs ? docs.menus : {}
        }))

        this.step(function(){

            var then = this;
            for(var i=0 ; i < menus.length ; i++){

                (function(i){
                    if(menus[i].action == "news"){
                        helper.db.coll("welab/reply").findOne({_id:helper.db.id(menus[i].reply)},then.hold(function(err,doc){
                            if(err) throw err ;
                            if(doc){
                                menus[i].reply = '<a href="/welab/reply/detail?_id='+doc._id+'">'+doc.title || doc.name+"</a>"
                            }
                        }))
                    }


                    //sum
                    var _eventKey = menus[i].action == "link" ? menus[i].reply : menus[i].tag;
                    helper.db.coll("welab/feeds").find({status:"点击菜单","params.EventKey":_eventKey,time:{$gt:startTimeStamp,$lt:endTimeStamp}}).count(then.hold(function(err,doc){
                        if(err) throw err ;
                        menus[i].sum =  doc||0
                    }))
                })(i)

                if(menus[i].items){

                    for(var ii=0 ; ii< menus[i].items.length ; ii++){

                        (function(i,ii){

                            if(menus[i].items[ii].action == "news"){
                                helper.db.coll("welab/reply").findOne({_id:helper.db.id(menus[i].items[ii].reply)},then.hold(function(err,doc){
                                    if(err) throw err ;
                                    if(doc){
                                        menus[i].items[ii].reply = '<a href="/welab/reply/detail?_id='+doc._id+'">'+doc.title || doc.name+'</a>'
                                    }
                                }))
                            }

                            //sum
                            var _eventKey = menus[i].items[ii].action == "link" ? menus[i].items[ii].reply : menus[i].items[ii].tag;
                            helper.db.coll("welab/feeds").find({status:"点击菜单","params.EventKey":_eventKey,time:{$gt:startTimeStamp,$lt:endTimeStamp}}).count(then.hold(function(err,doc){
                                if(err) throw err ;
                                menus[i].items[ii].sum =  doc||0
                            }))
                        })(i,ii)
                    }
                }

            }
        })

        this.step(function(){
            for(var i=0;i<menus.length;i++){
                if(menus[i].items){
                    for(var j=0 ; j< menus[i].items.length ; j++){
                        (function(i,j){
                            var _eventKey = menus[i].items[j].action == "link" ? menus[i].items[j].reply : menus[i].items[j].tag;
                            helper.db.coll("welab/feeds").find({status:"点击菜单","params.EventKey":_eventKey,time:{$gt:startTimeStamp,$lt:endTimeStamp}}).count(then.hold(function(err,doc){
                                if(err) throw err ;
                                count +=doc;
                            }))
                        })(i,j)
                    }
                }
            }
        })

        this.step(function(){
            for(var i=0;i<menus.length;i++){
                for(var j=0;j<menus[i].items.length;j++){
                    if(menus[i].items[j].action=="text"){
                        menus[i].items[j].reply = decodeURIComponent(menus[i].items[j].reply).replace(/<[\/]*br[^>]*>/img, "")
                    }
                }
            }
        })

        this.step(function(){
            nut.model.sum = count;
            nut.model.menu = menus

        })
    }

    //复写 /welab/apps/mass/index
    var welabAppsMassIndex = require("welab/apps/mass/controllers/index");
    welabAppsMassIndex.view = "lavico/controllers/welab/mass/templates/index.html";
    welabAppsMassIndex.viewIn=function() {

        // search box--搜索显示
        $.searchInitConditions([
            {field: 'realname', title: '姓名', type: 'text'}
            ,
            {field: 'gender', title: '性别', type: 'gender'}
            ,
            {field: 'birthday', title: '年龄', type: 'birthday'}
            ,
            {field: 'email', title: '电子邮件', type: 'text'}
            ,
            {field: 'mobile', title: '移动电话', type: 'text'}
            ,
            {field: 'registerTime', title: '注册时间', type: 'date'}
            ,
            {field: 'followTime', title: '关注时间', type: 'date'}
            ,
            {field: 'tags', title: '标签', type: 'text'}
            ,
            {field: 'nickname', title: '昵称', type: 'text'}
            ,
            {field: 'city', title: '城市', type: 'text'}
            ,
            {field: 'profession', title: '行业', type: 'text'}
            ,
            {field: 'source', title: '关注来源', type: 'value'}
            ,
            {field: 'HaiLanMemberInfo.action', title: '绑定', type: 'member'}
            ,
            {field: 'HaiLanMemberInfo.type', title: '会员卡', type: 'membertype'}
            ,
            {field: 'isFollow', title: '关注', type: 'follow'}
            ,
            {field: 'isRegister', title: '注册', type: 'register'}
        ]);

        $(".btnsearch").click(function () {
            var conditions = $(this).searchConditions();
            if (!conditions.length)
                return;

            var searchObj = {params: [
                {name: "conditions", value: JSON.stringify(conditions)},
                {name: "logic", value: $("[name=searchLogic]").val()}
            ]};
            var tag = $("#tag").val()
            $.ajax({
                url: "/lavico/welab/mass/controllers/form:selecttoman",
                cache: false,
                type: 'POST',
                data:searchObj,
            }).done(function( json ) {
                $.globalMessenger().post({
                    message: json.msg + "人",
                    showCloseButton: true})
            });
            console.log(searchObj);



        });

        //取消筛选
        $(".btncancel").click(function () {
            $('.searchConditionOuter').empty()
        });

    }

    var welabAppsMassForm = require("welab/apps/mass/controllers/form");
    welabAppsMassForm = "lavico/controllers/welab/mass/controllers/form"


};

