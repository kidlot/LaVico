var oauth = require("lavico/lib/oAuth.js") ;

module.exports = {

	layout: "lavico/layout"
	, view: "lavico/templates/bargain/kv.html"

    , process: function(seed,nut)
    {
        var doc = {};

        nut.model.fromWelab = seed.fromWelab || ""

        var then = this;

        var cbUrl = "http://"+this.req.headers.host + this.req.url

        oauth.getOpenid(seed,this.req,this.res,cbUrl,function(res){

            if(res.err){

               console.log("获得OPID错误")
            }else{

                helper.db.coll("lavico/bargain").find({"switcher":"on"}).toArray(then.hold(function(err,_doc){
                    doc = _doc || {}
                }))

                helper.db.coll("welab/customers").findOne({wechatid:res.openid},then.hold(function(err,customers){
                    var customers = customers || {}

                    nut.model.isVip = false
                    if(customers.HaiLanMemberInfo && customers.HaiLanMemberInfo.memberID && customers.HaiLanMemberInfo.action == "bind"){
                        nut.model.isVip = true
                    }
                }))

                then.step(function(){

                    nut.model._id = seed._id || ""
                    nut.model.wxid = res.openid
                    nut.model.doc = doc
                })
            }
        })
    }
}







