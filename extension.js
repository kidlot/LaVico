var wechatutil = require("welab/controllers/wechat-api/util.js") ;
var bargain = require("./weixinReply/bargain.js") ;
var score=require("./weixinReply/score.js");
var reedem=require("./weixinReply/reedem.js");
var announcement=require("./weixinReply/announcement.js");
var activity = require("./weixinReply/activity.js") ;
var shake = require("./weixinReply/shake.js") ;
var lookbook = require("./weixinReply/lookbook.js") ;
//var member_apply = require("./weixinReply/apply.js") ;
var aSteps = require("./lib/aSteps.js");
var welabUserlist = require("welab/controllers/user/list.js");
var util = require("welab/controllers/summary/util.js") ;
var summary = require("welab/controllers/user/summary.js") ;
var search = require("welab/lib/search.js") ;

var wechatapi = require("welab/lib/wechat-api.js") ;
var middleware = require('lavico/lib/middleware.js');
var Steps = require("opencomb/node_modules/ocsteps");

exports.onload = function(application){

    // 我要侃价
    bargain.load()
    //答题抢积分
    score.load();
    //公告
    announcement.load();
    //积分兑换
    reedem.load();

	activity.load();
	shake.load();
    // 精英搭配
    lookbook.load();

	//member_apply.load();
    //门店查询
    wechatapi.registerReply(9,function(msg,req,res,next){
        if(msg.MsgType=="location"){
            var lat=msg.Location_X;
            var lng=msg.Location_Y;

            var docJson;
            var jsonData={};
            var storeDistance=[];
            var storeList=[];
            var replyArr=[];

            Steps(
                function(){
                    jsonData.perPage=1000;
                    jsonData.pageNum=1;
                    //接口返回的doc都是字符串
                    middleware.request('Shops',jsonData,
                        this.hold(function(err,doc){
                            if(err) throw err;
                            docJson=JSON.parse(doc);
                            //return docJson;//注意字符串和对象格式
                        })
                    )
                },
                //计算两点之间距离
                function(){
                    if(docJson){
                        for(var i=0;i<docJson.list.length;i++){
                            if(docJson.list[i].LOG!=null && docJson.list[i].LAT!=null){
                                var kgmeter=getGreatCircleDistance(lng,lat,docJson.list[i].LOG,docJson.list[i].LAT)/1000;
                                docJson.list[i].distance=changeTwoDecimal(kgmeter)
                                storeDistance.push(changeTwoDecimal(kgmeter))
                            }
                        }
                        storeDistance=storeDistance.sort(function(a,b){return a>b?1:-1});
                    }
                },

                function(){
                    try{
                        for(var i=0;i<storeDistance.length;i++){
                            for(var j=0;j<docJson.list.length;j++){
                                if(storeDistance[i]==docJson.list[j].distance){
                                    storeList.push(docJson.list[j]);
                                }
                            }
                        }
                    }catch(e){
                        if(e) throw e;
                    }
                },

                function(){
                    for(var i=0;i<storeList.length;i++){
                        reply={};
                        reply.title=storeList[i].NAME+"店距离:"+storeList[i].distance+"公里";
                        reply.description=storeList[i].ADDR;
                        if(storeList[i].PICURL==null)
                            reply.picurl="http://json.imagchina.com/lavico/public/images/lavico_default.png";
                        else
                            reply.picurl=storeList[i].PICURL;
                        reply.url="http://json.imagchina.com/lavico/store/searchByCity:show?CODE="+storeList[i].CODE+"1";
                        replyArr.push(reply);
                    }
                },
                function(){
                    res.reply(replyArr);
                }
            )()
        }
    });


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





    /**
     * reply list
     * @param oriMsg
     * @param replyDoc
     * @param apiReq
     * @returns {Array}
     */
    wechatutil.makeReply.list = function(oriMsg,replyDoc,apiReq)
    {
        replyDoc.items.unshift(replyDoc) ;

        var ret = [] ;
        var replyId = replyDoc._id.toString() ;
        for(var i=0;i<replyDoc.items.length;i++)
        {
            var item = replyDoc.items[i] ;
            ret.push({
                title: item.title
                , description: item.tabloid
                , picurl: item.pic? "http://"+apiReq.headers.host+item.pic: ''
                , url: item.link?
                    item.link.replace("{host}",apiReq.headers.host).replace("{wxid}",oriMsg.FromUserName):
                    ("http://"+apiReq.headers.host+"/welab/detail?_id="+replyId+(i ? ("&item="+(i)): "" )+"&wxid="+oriMsg.FromUserName)
            }) ;
        }
        return ret ;
    }
    /*
    * 更新个人信息资料
    * */
    var _time = 1000*10*10;
    var timer = setInterval(function(){
             http = require('http');
             options = {
                host: '127.0.0.1',
                port: 80,
                path: '/lavico/member/card_member/info:updateUserInfo',
                method: 'GET'
             };
             req = http.request(options, function(res) {
                 res.setEncoding('utf8');
                 var body='';
                 res.on('data', function(data) {
                     body +=data;
                     console.log(data);
                 });
             });
             //req.write(post_data);
             console.log(req.end());
         },_time);
    //clearInterval(timer);

}


var EARTH_RADIUS = 6378137.0;    //单位M
var PI = Math.PI;

function getRad(d){
    return d*PI/180.0;
}

//两点之间的距离
function getGreatCircleDistance(lng1,lat1,lng2,lat2)
{
    var radLat1 = getRad(lat1);
    var radLat2 = getRad(lat2);

    var dy = radLat1 - radLat2;	//a
    var dx = getRad(lng1) - getRad(lng2);	//b

    var s = 2*Math.asin(Math.sqrt(Math.pow(Math.sin(dy/2),2) + Math.cos(radLat1)*Math.cos(radLat2)*Math.pow(Math.sin(dx/2),2)));
    s = s*EARTH_RADIUS;
    s = Math.round(s*10000)/10000.0;

    return s;
}

function changeTwoDecimal(floatvar)
{
    var f_x = parseFloat(floatvar);
    if (isNaN(f_x))
    {
        alert('function:changeTwoDecimal->parameter error');
        return false;
    }
    var f_x = Math.round(floatvar*100)/100;
    return f_x;
}
