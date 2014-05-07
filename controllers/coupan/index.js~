module.exports = {

	layout: "welab/Layout"
	, view: "lavico/templates/bargain/index.html"

    , process: function(seed,nut)
    {

        var list = {};
        helper.db.coll("lavico/bargain").find({}).sort({createTime:-1}).page(50,seed.page||1,this.hold(function(err,page){
            list = page
        })) ;

        this.step(function(){
            nut.model.page = list
        })
    }
}







