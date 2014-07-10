module.exports = {

	layout: null
    , view: null

    , process: function(seed,nut)
    {

        console.log("wxid",seed.wxid)
        if(seed.wxid){

            helper.db.coll("welab/customers").findOne({wechatid:seed.wxid},this.hold(function(err,customers){
                var customers = customers || {}

                if(customers.HaiLanMemberInfo && customers.HaiLanMemberInfo.memberID && customers.HaiLanMemberInfo.action == "bind"){
                    _log(seed.wxid,customers.HaiLanMemberInfo.memberID,seed.action,decodeURIComponent(seed.url),seed.fromWelab||"",seed.replyid);
                }else{
                    _log(seed.wxid,0,seed.action,decodeURIComponent(seed.url),seed.fromWelab||"",seed.replyid);
                }
            }))


            nut.disable();
            var data = JSON.stringify({err:0});
            this.res.writeHead(200, { 'Content-Type': 'application/json' });
            this.res.write(data);
            this.res.end();
        }else{


            nut.disable();
            var data = JSON.stringify({err:1});
            this.res.writeHead(200, { 'Content-Type': 'application/json' });
            this.res.write(data);
            this.res.end();
        }
    }

}




function _log(wxid,memberID,action,url,fromWelab,replyid){


//    helper.db.coll("lavico/user/views").insert({createTime:new Date().getTime(),wxid:wxid,memberID:memberID,action:action,url:url}, function(err, doc){
//        if(err)console.log(err)
//    })


    // 自己浏览
    if(action == "浏览"){

        helper.db.coll("welab/replyViewLog").insert({
                "time": new Date().getTime(),
                "action": "view",
                reply:replyid,
                "by": wxid
            }
            , function(err, doc){
                if(err)console.log(err)
            })
    }

    // 好友浏览
    if(action == "好友浏览"){

        helper.db.coll("welab/replyViewLog").insert({
                "time": new Date().getTime(),
                "action": "view."+fromWelab,
                reply:replyid,
                "by": wxid
            }
            , function(err, doc){
                if(err)console.log(err)
            })
    }
    // 转发
    if(action == "转发好友"){

        helper.db.coll("welab/replyViewLog").insert({
                "time": new Date().getTime(),
                "action": "share.friend",
                reply:replyid,
                "by": wxid
            }
            , function(err, doc){
                if(err)console.log(err)
            })
    }
    if(action == "转发朋友圈"){

        helper.db.coll("welab/replyViewLog").insert({
                "time": new Date().getTime(),
                "action": "share.timeline",
                reply:replyid,
                "by": wxid
            }
            , function(err, doc){
                if(err)console.log(err)
            })
    }


}