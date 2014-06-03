module.exports = {

	layout: "lavico/layout"
	, view: "lavico/templates/lookbook/product.html"

    , process: function(seed,nut)
    {
        var doc = {};

        this.res.setHeader("Cache-Control", "no-cache");
        this.res.setHeader("Cache-Control", "no-store");
        this.res.setHeader("Pragma","no-cache");

        if(seed.wxid && seed._id){

            nut.model.wxid = seed.wxid
            nut.model._id = seed._id
            nut.model.productId = seed.productId
            nut.model.source = seed.source||""
            nut.model.memberID = false
            nut.model.fromWelab = seed.fromWelab || ""
            nut.model.pageNum = seed.pageNum || 1
            nut.model.pageNum

            helper.db.coll("welab/customers").findOne({wechatid:seed.wxid},this.hold(function(err,customers){
                var customers = customers || {}

                nut.model.isVip = false
                if(customers.HaiLanMemberInfo && customers.HaiLanMemberInfo.memberID && customers.HaiLanMemberInfo.action == "bind"){
                    nut.model.isVip = true
                    nut.model.memberID = customers.HaiLanMemberInfo.memberID
                }
            }))


            helper.db.coll("lavico/lookbook").findOne({_id:helper.db.id(seed._id)},this.hold(function(err,_doc){
                doc = _doc || {}
                nut.model.doc = doc.page[nut.model.pageNum-1]

                for(var i=0 ; i < nut.model.doc.product.length ; i++){

                    if(nut.model.doc.product[i]._id == seed.productId){
                        nut.model.doc.product[i].current = true
                    }
                }
                nut.model.jsonDoc = JSON.stringify(nut.model.doc)
                console.log("11",nut.model.doc)

            }))
        }else{
            nut.disable();
            var data = JSON.stringify({err:1,msg:"没有微信ID或产品ID"});
            this.res.writeHead(200, { 'Content-Type': 'application/json' });
            this.res.write(data);
            this.res.end();
        }
    }
}







