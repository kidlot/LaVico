var oauth = require("lavico/lib/oAuth.js") ;
var Steps = require("ocsteps") ;

module.exports = {

	layout: "lavico/layout"
	, view: "lavico/templates/bargain/kv.html"

    , process: function(seed,nut)
    {
        var doc = {};

        nut.model.fromWelab = seed.fromWelab || ""

        var then = this;

        var cbUrl = "http://"+this.req.headers.host + this.req.url

        if(seed.wxid){
            module._run(seed.wxid,nut)
        }else{
            oauth.getOpenid(this.req,this.res,seed.code,cbUrl,function(res){

                if(res.err){
                    console.log("获得OPID错误",res)
                }else{
                    module.run(res.openid)
                }
            })
        }

    }
}



module._run = function (wxid,nut){

    Steps(

        function(){

            helper.db.coll("lavico/bargain").find({"switcher":"on"}).toArray(then.hold(function(err,_doc){
                doc = _doc || {}
            }))

            helper.db.coll("welab/customers").findOne({wechatid:wxid},then.hold(function(err,customers){
                var customers = customers || {}

                nut.model.isVip = false
                if(customers.HaiLanMemberInfo && customers.HaiLanMemberInfo.memberID && customers.HaiLanMemberInfo.action == "bind"){
                    nut.model.isVip = true
                }
            }))
        }

        , function(){

            nut.model._id = seed._id || ""
            nut.model.wxid = res.openid
            nut.model.doc = doc
        }
    )()

}


