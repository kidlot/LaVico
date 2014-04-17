var wechatutil = require("welab/controllers/wechat-api/util.js") ;
var bargain = require("./weixinReply/bargain.js") ;
var score=require("./weixinReply/score.js");
var announcement=require("./weixinReply/announcement.js");
var activity = require("./weixinReply/activity.js") ;
var shake = require("./weixinReply/shake.js") ;
var lookbook = require("./weixinReply/lookbook.js") ;
//var member_apply = require("./weixinReply/apply.js") ;
var aSteps = require("./lib/aSteps.js");

exports.onload = function(application){

    // 我要侃价
    bargain.load()
    //答题抢积分
    score.load();
    //公告
    announcement.load();

	  activity.load();
	  shake.load();
    // 精英搭配
    lookbook.load()

	//member_apply.load();

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


}
