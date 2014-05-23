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
            nut.model.pageNum = parseInt(seed.pageNum) || 1
            nut.model.bigPicIndex = parseInt(seed.bigPicIndex) || 1

            helper.db.coll("lavico/lookbook").findOne({_id:helper.db.id(seed._id)},this.hold(function(err,_doc){
                doc = _doc || {}
                nut.model.doc = doc.page[nut.model.pageNum-1]
                nut.model.jsonPage = JSON.stringify(nut.model.doc)
                nut.model.lookbookName = doc.name
                nut.model.lookbookType = doc.type

                console.log("page",nut.model.doc)
                for(var i=0 ; i < nut.model.doc.product.length ; i++){

                    if(nut.model.doc.product[i]._id == seed.productId){
                        nut.model.product = nut.model.doc.product[i]
                    }
                }

                nut.model.sumBigPicIndex = nut.model.product.bigPic ? nut.model.product.bigPic.length : "0"
                console.log("product",nut.model.product)
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







