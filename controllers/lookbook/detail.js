module.exports = {

	layout: "lavico/layout"
	, view: "lavico/templates/lookbook/detail.html"

    , process: function(seed,nut)
    {
        var doc = {};

        this.res.setHeader("Cache-Control", "no-cache");
        this.res.setHeader("Cache-Control", "no-store");
        this.res.setHeader("Pragma","no-cache");

        if(seed.wxid && seed._id){

            nut.model.wxid = seed.wxid
            nut.model._id = seed._id
            nut.model.pageNum = parseInt(seed.pageNum) || 1
            nut.model.fromWelab = seed.fromWelab || ""

            helper.db.coll("lavico/lookbook").findOne({_id:helper.db.id(seed._id)},this.hold(function(err,_doc){
                doc = _doc || {}
                nut.model.allPage = doc
                nut.model.doc = doc.page[nut.model.pageNum-1]
                nut.model.lookbookType = doc.type
                nut.model.sumPageNum = doc.page.length
                console.log(nut.model.doc)
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







