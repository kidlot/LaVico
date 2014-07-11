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
                    _log(seed.wxid,customers.HaiLanMemberInfo.memberID,seed.action,decodeURIComponent(seed.url),seed.replyid);
                }else{
                    _log(seed.wxid,0,seed.action,decodeURIComponent(seed.url),seed.replyid);
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



function _log(wxid,memberID,action,url,replyid){

    var _funcName = 'addReplyViewLog("'+wxid+'","'+replyid+'","'+action+'","'+url+'")'
    console.log(_funcName)
    helper.db.eval(_funcName,function(err,doc){
        console.log("插入ViewLog",err,doc)
    });

}