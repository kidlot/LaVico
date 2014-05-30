var oauth = require("lavico/lib/oAuth.js") ;
var Steps = require("ocsteps") ;

module.exports = {

	layout: "lavico/layout"
	, view: "lavico/templates/bargain/kv.html"

    , process: function(seed,nut)
    {
        var doc = {};

        nut.model.fromWelab = seed.fromWelab || ""
        nut.model._id = seed._id || ""

        var cbUrl = "http://"+this.req.headers.host + this.req.url

        var _cb = this.hold();

        if(seed.wxid){
            module._run(seed.wxid,nut,_cb)
        }else{
            oauth.getOpenid(this.req,this.res,seed.code,cbUrl,function(res){

                if(res.err){
                    console.log("获得OPID错误",res)
                }else{
                    module._run(res.openid,nut,_cb)
                }
            })
        }

    }
}



module._run = function (wxid,nut,_cb){

    nut.model.wxid = wxid

    Steps(

        function(){

            helper.db.coll("lavico/bargain").find({"switcher":"on"}).toArray(this.hold(function(err,_doc){
                doc = _doc || {}
                nut.model.doc = doc
            }))

            helper.db.coll("welab/customers").findOne({wechatid:wxid},this.hold(function(err,customers){
                var customers = customers || {}

                nut.model.isVip = false
                if(customers.HaiLanMemberInfo && customers.HaiLanMemberInfo.memberID && customers.HaiLanMemberInfo.action == "bind"){
                    nut.model.isVip = true
                }
            }))
        }

        , function(){
            _cb()
        }
    )()

}


