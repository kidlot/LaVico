var wechatutil = require("welab/controllers/wechat-api/util.js") ;
var bargain = require("./weixinReply/bargain.js") ;
<<<<<<< HEAD
var member_apply = require("./weixinReply/apply.js") ;
var score=require("./weixinReply/score.js")
=======
<<<<<<< HEAD
var activity = require("./weixinReply/activity.js") ;
=======
var lookbook = require("./weixinReply/lookbook.js") ;
//var member_apply = require("./weixinReply/apply.js") ;
>>>>>>> e4c4b16a2a1b6f8546496c2fddbae66d7386183c
>>>>>>> d61396166c571fdd5b145cbda0f242e59967c141
var aSteps = require("./lib/aSteps.js");

exports.onload = function(application){


    // 我要侃价
    bargain.load()
<<<<<<< HEAD
	member_apply.load();
    //json.cao
    score.load();
=======
<<<<<<< HEAD
	  activity.load();
=======
    // 精英搭配
    lookbook.load()
>>>>>>> d61396166c571fdd5b145cbda0f242e59967c141

	//member_apply.load();



>>>>>>> e4c4b16a2a1b6f8546496c2fddbae66d7386183c
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
