module.exports = {

	layout: "welab/Layout"
	, view: "lavico/templates/bargain/index.html"

    , process: function(seed,nut)
    {

        var list = {};
        helper.db.coll("lavico/bargain").find({}).sort({createTime:-1}).page(50,seed.page||1,this.hold(function(err,page){
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

                if(!page.docs[i].switcher){
                    page.docs[i].switcher="off";
                }
            }
        })) ;

        this.step(function(){

            console.log(list);
            nut.model.page = list;
        })
    }
}







