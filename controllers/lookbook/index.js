module.exports = {

	layout: "welab/Layout"
	, view: "lavico/templates/lookbook/index.html"

    , process: function(seed,nut)
    {

        var list = {};
        helper.db.coll("lavico/lookbook").find({}).sort({createTime:-1}).page(50,seed.page||1,this.hold(function(err,page){
            list = page
            for (var i=0;i<page.docs.length;i++)
            {
                if(new Date().getTime() < page.docs[i].startDate){
                    page.docs[i].stat = "未开始"
                }else if(new Date().getTime() > page.docs[i].stopDate){
                    page.docs[i].stat = "已结束"
                }else{
                    page.docs[i].stat = "进行中"
                }
            }
        })) ;

        this.step(function(){
            nut.model.page = list
        })
    }
}







