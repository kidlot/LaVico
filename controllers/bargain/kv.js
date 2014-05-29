module.exports = {

	layout: "lavico/layout"
	, view: "lavico/templates/bargain/kv.html"

    , process: function(seed,nut)
    {
        var doc = {};

        if(seed.wxid){

            helper.db.coll("lavico/bargain").find({"switcher":"on"}).toArray(this.hold(function(err,_doc){
                doc = _doc || {}
            }))

            helper.db.coll("welab/customers").findOne({wechatid:seed.wxid},this.hold(function(err,customers){
                var customers = customers || {}

                nut.model.isVip = false
                if(customers.HaiLanMemberInfo && customers.HaiLanMemberInfo.memberID && customers.HaiLanMemberInfo.action == "bind"){
                    nut.model.isVip = true
                }
            }))
        }

        this.step(function(){

            nut.model._id = seed._id || ""
            nut.model.wxid = seed.wxid
            nut.model.doc = doc
        })
    }
}







