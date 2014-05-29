var search = require("welab/lib/search.js") ;
var summary = require("welab/controllers/user/summary.js") ;
var util = require("welab/controllers/summary/util.js") ;

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
//    }

    var welabUserlist = require("welab/controllers/user/list.js");


    // 复写用户列表的导出
    welabUserlist.actions.exports.process = function(seed, nut){

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

        var conditions = search.conditions(seed) ;
        var _data = [];

        var sort = {_id:-1};
        if(seed.sortname){

            var order = seed.sortorder == "asc" ? 1 : -1;
            sort = eval("({"+seed.sortname+":"+order+"})")
        }


        this.step(function(){
            //console.log("tip:"+conditions);
            helper.db.coll("welab/customers").find(conditions).sort(sort).toArray(this.hold(function(err,docs){
                if(err) throw err ;

                for (var i=0; i<docs.length; i++)
                {

                    docs[i].realname = docs[i].realname || '';
                    docs[i].nickname = docs[i].nickname || '';
                    docs[i].city = docs[i].city || '';
                    docs[i].followCount = docs[i].followCount || '1';
                    docs[i].messageCount = docs[i].messageCount && otherData.totaMessages ? (docs[i].messageCount) + " " + (parseInt((docs[i].messageCount / otherData.totaMessages)*100)) + "%" : "0";
                    docs[i].isRegister = docs[i].registerTime ? "是" : "否"
                    docs[i].gender = docs[i].gender == 'female'?"女": (docs[i].gender == 'male' ? "男" : '')
                    docs[i].birthday = docs[i].birthday ? parseInt(((new Date()) - (parseInt(docs[i].birthday))) / (1000*60*60*24*365)) : ""

                    docs[i].source = docs[i].source || '';
                    docs[i].cardtype = docs[i].cardtype || '微信会员卡';
                    docs[i].industry = docs[i].industry || '';

                    var tags = [];
                    if( docs[i].tags){
                        for (var ii=0; ii<docs[i].tags.length; ii++)
                        {
                            tags.push('<span class="tm-tag tm-tag-info" ><span>'+docs[i].tags[ii]+'</span><a href="#" class="tm-tag-remove" tagidtoremove="1" data-dismiss="alert" onclick="removeTagOrKeyword(this)">×</a></span>')
                        }
                    }
                    docs[i].tags = tags.join("&nbsp;")
                    docs[i].followTimebak = docs[i].followTime;
                    docs[i].followTime = docs[i].followTime ? parseInt(((new Date()) - (new Date(docs[i].followTime*1000))) / (1000*60*60*24)) : ""
                    docs[i].registerTime = docs[i].registerTime ? parseInt(((new Date()) - (new Date(docs[i].registerTime))) / (1000*60*60*24)) : ""
                    docs[i].lastMessageTime = parseInt(((new Date()) - (new Date(docs[i].lastMessageTime))) / (1000*60*60*24))
                    docs[i].viewCount = docs[i].viewCount && otherData.totalView ? (docs[i].viewCount) + " <span style='color: #1ABC9C'>" + (parseInt((docs[i].viewCount / otherData.totalView)*100)) + "%</span>" : "0";

                    var viewFriendCount = docs[i].viewFriendCount + docs[i].viewTimeLineCount;

                    docs[i].viewFriendCount = viewFriendCount && otherData.totalViewFriend ? (viewFriendCount) + " <span style='color: #1ABC9C'>" + (parseInt((viewFriendCount / otherData.totalViewFriend)*100)) + "%</span>" : "0";
                    var viewShareCount = docs[i].shareFriendCount + docs[i].shareTimeLineCount;

                    docs[i].shareFriendCount = viewShareCount && otherData.totalShare ? (viewShareCount) + " <span style='color: #1ABC9C'>" + (parseInt((viewShareCount / otherData.totalShare)*100)) + "%</span>" : "0";

                    docs[i].unfollowTimeForFollow = docs[i].isFollow == false ? parseInt((docs[i].unfollowTime - (docs[i].followTimebak*1000)) / (1000*60*60*24)) : ''
                    docs[i].unfollowTimeForReg = docs[i].registerTime ? parseInt((docs[i].unfollowTime - (docs[i].registerTime)) / (1000*60*60*24)) : ''

                    _data.push(docs[i])
                }
            })) ;

        })


        //导出
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
                    caption: '城市',
                    type: 'string'
                }, {
                    caption: '行业',
                    type: 'string'
                }, {
                    caption: '卡类型',
                    type: 'string'
                }, {
                    caption: '关注来源',
                    type: 'string'
                }, {
                    caption: '标签',
                    type: 'string'
                }, {
                    caption: '已关注(天)',
                    type: 'string'
                }, {
                    caption: '已注册(天)',
                    type: 'string'
                }, {
                    caption: '未会话(天)',
                    type: 'string'
                }, {
                    caption: '会话数(占比)',
                    type: 'string'
                }, {
                    caption: '注册',
                    type: 'string'
                }, {
                    caption: '自己浏览(占比)',
                    type: 'string'
                }, {
                    caption: '分享(占比)',
                    type: 'string'
                }, {
                    caption: '好友浏览(占比)',
                    type: 'string'
                }, {
                    caption: '关注次数',
                    type: 'string'
                }, {
                    caption: '取消关注距关注(天)',
                    type: 'string'
                }, {
                    caption: '取消关注距注册(天)',
                    type: 'string'
                }


            ];



            conf.rows = [];

            for(var i=0 ;i < _data.length ;i++){

                var rows;
                rows = [
                    _data[i].nickname,
                    _data[i].realname,
                    _data[i].gender,
                    _data[i].birthday,
                    _data[i].city,
                    _data[i].industry,
                    _data[i].cardtype,
                    _data[i].source,
                    _data[i].tags,
                    _data[i].followTime,
                    _data[i].registerTime,
                    _data[i].lastMessageTime,
                    _data[i].messageCount,
                    _data[i].isRegister,
                    _data[i].viewCount,
                    _data[i].shareFriendCount,
                    _data[i].viewFriendCount,
                    _data[i].followCount,
                    _data[i].unfollowTimeForFollow,
                    _data[i].unfollowTimeForReg
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

    // 复写用户列表
    welabUserlist.actions.jsonData.process = function(seed, nut){
        console.log("---search customers---");
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
            console.log(conditions);


            helper.db.coll("welab/customers").find(conditions).sort(sort).page((parseInt(seed.rp) || 20),seed.page||1,this.hold(function(err,page){
                if(err) throw err ;

                _data.page = page.currentPage
                _data.total = page.totalcount

                for (var i=0; i<page.docs.length; i++)
                {
                    page.docs[i].input = '<input type="checkbox" userid="'+page.docs[i]._id+'" onclick="checkUser(this)" >';
                    page.docs[i].realname = '<a href="/welab/user/detail?_id='+page.docs[i]._id+'" class="stay-top">'+ (page.docs[i].realname || '') +'</a>'         ;
                    page.docs[i].nickname = '<a href="/welab/user/detail?_id='+page.docs[i]._id+'" class="stay-top">'+ (page.docs[i].nickname || '') +'</a>'         ;
                    page.docs[i].city = page.docs[i].city || '';
                    page.docs[i].followCount = page.docs[i].followCount || '1';
                    page.docs[i].messageCount = page.docs[i].messageCount && otherData.totaMessages ? (page.docs[i].messageCount) + " <span style='color: #1ABC9C'>" + (parseInt((page.docs[i].messageCount / otherData.totaMessages)*100)) + "%</span>" : "0";
                    page.docs[i].isRegister = page.docs[i].registerTime ? "是" : "否"
                    page.docs[i].gender = page.docs[i].gender == 'female'?"女": (page.docs[i].gender == 'male' ? "男" : '')
                    page.docs[i].birthday = page.docs[i].birthday ? parseInt(((new Date()) - (parseInt(page.docs[i].birthday))) / (1000*60*60*24*365)) : ""

                    page.docs[i].source = page.docs[i].source || '';
                    page.docs[i].cardtype = page.docs[i].cardtype || '微信会员卡';
                    page.docs[i].industry = page.docs[i].profession || '';

                    var cardtype = {1:"白卡", 2:"VIP卡", 3:"白金VIP卡"}
                    page.docs[i].cardtype = page.docs[i].HaiLanMemberInfo ? cardtype[page.docs[i].HaiLanMemberInfo.type]||"" : "";

                    var tags = [];
                    if( page.docs[i].tags){
                        for (var ii=0; ii<page.docs[i].tags.length; ii++)
                        {
                            tags.push('<span class="tm-tag tm-tag-info" ><span>'+page.docs[i].tags[ii]+'</span><a href="#" class="tm-tag-remove" tagidtoremove="1" data-dismiss="alert" onclick="removeTagOrKeyword(this)">×</a></span>')
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

            var tags = $("input[type='hidden'][name='tagsVal']").val();
            if( tags == ""){
                $.globalMessenger().post({
                    message: '至少设置一个标签.',
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
                $("#userList").find("tr").each(function( i, o){
                    var tds = $(o).find("td");

                    if(tds.eq(0).find("input")[0].checked){

                        // tags
                        var aOldTagsList = [];
                        tds.eq(9).find("span").each(function(i,o){
                            aOldTagsList.push($(o).find("span").text());
                        })

                        var tags = $("input[type='hidden'][name='tagsVal']").val();
                        var aNewTagsList = tags.split(",");


                        var _is = false;
                        for (var iii=0; iii<aNewTagsList.length; iii++)
                        {
                            _is = false;

                            for (var ii=0; ii<aOldTagsList.length; ii++)
                            {
                                if( aOldTagsList[ii].toLowerCase() == aNewTagsList[iii].toLowerCase()){
                                    _is = true;
                                    break;
                                }
                            }

                            if( _is == false){

                                var _span = '<span class="tm-tag tm-tag-info" ><span>'+aNewTagsList[iii]+'</span><a href="#" class="tm-tag-remove" data-dismiss="alert" onclick="removeTagOrKeyword( \'tag\', this)">×</a></span>';
                                tds.eq(9).find("div").append(_span);
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
        jQuery("#tags").tagsManager({
            prefilled: [],
            hiddenTagListName: 'tagsVal'
        });


        // search box--搜索显示
        $.searchInitConditions([
            {field:'realname',title:'姓名',type:'text'}
            , {field:'gender',title:'性别',type:'gender'}
            , {field:'age',title:'年龄',type:'num'}
            , {field:'email',title:'电子邮件',type:'text'}
            , {field:'mobile',title:'移动电话',type:'text'}
            , {field:'createtime',title:'注册时间',type:'date'}
            , {field:'followTime',title:'关注时间',type:'date'}
            , {field:'tags',title:'标签',type:'value'}
            , {field:'nickname',title:'昵称',type:'value'}
            , {field:'city',title:'城市',type:'value'}
            , {field:'profession',title:'行业',type:'value'}
            , {field:'source',title:'关注来源',type:'value'}
            , {field:'HaiLanMemberInfo.action',title:'绑定与否',type:'value'}
            , {field:'HaiLanMemberInfo.cardNumber',title:'会员卡',type:'value'}
        ]) ;

        $(".btnsearch").click(function(){
            var conditions = $(this).searchConditions() ;
            //alert(JSON.stringify(conditions));
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

            jQuery("#tags").tagsManager('empty');

            $('#tagModal').modal('toggle');
            oUserSetOption = {} ;
            oUserSetOption.data = [];
            oUserSetOption.data.push({name:"sUserList",value:aList.join(",")});
            return false;
        })


        /**
         * 设置标签
         */
        $(".sendMessageView").on("click",function(){

            var aList = getUserList();
            if( aList.length == 0){
                $.globalMessenger().post({
                    message: '至少选择一个用户.',
                    type: 'error',
                    showCloseButton: true})
                return ;
            }

            $('#sendMessageModal').modal('toggle');
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

    }


    var welabMessagelist = require("welab/controllers/MessageList.js");

    // 复写 messageList
    welabMessagelist.children.page.view = "lavico/templates/MessageListPage.html";


    // 复写 welab/user/detail by David.xu 2014-05-29 Start
    var welabUserDetail = require("welab/controllers/user/detail.js");

    welabUserDetail.view = "lavico/templates/welab/user/detail.html";
    welabUserDetail.process = function(seed,nut){
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

                console.log(_data)


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

    // 复写 welab/user/detail by David.xu 2014-05-29 End


};
