module.exports = {

	layout: null
	, view: "lavico/templates/bargain/detail.html"

    , process: function(seed,nut)
    {
        var doc = {};

        if(seed.wxid){

            helper.db.coll("lavico/bargain").findOne({startDate:{$lt:new Date().getTime()},stopDate:{$gt:new Date().getTime()}},this.hold(function(err,_doc){
                doc = _doc || {}
            }))
        }

        this.step(function(){
            nut.model.doc = doc
        })

    }
}







