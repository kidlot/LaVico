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
        }

        this.step(function(){

            nut.model._id = seed._id || ""
            nut.model.wxid = seed.wxid
            nut.model.doc = doc
        })
    }
}







