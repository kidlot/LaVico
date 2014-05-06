module.exports = {

    layout: "welab/Layout"
    , view: "lavico/templates/lookbook/statistics.html"

    , process: function(seed,nut)
    {
        if(seed._id){

            nut.model._id = seed._id
            var then = this
            var docs;

            helper.db.coll("lavico/lookbook").findOne({_id:helper.db.id(seed._id)},this.hold(function(err,_doc){

                docs = _doc
                for(var i=0;i<docs.page.length;i++){

                    for(var ii=0;ii<docs.page[i].product.length;ii++){

                        (function(i,ii){

                            helper.db.coll("welab/customers").find({"lookbook.productID":docs.page[i].product[ii]._id}).count(then.hold(function(err,_doc2){
                                docs.page[i].product[ii].sumFavorites = _doc2
                            }))
                        })(i,ii)
                    }
                }
            }))

            this.step(function(){

                nut.model.doc = docs
            })


        }else{
            nut.disable();
            var data = JSON.stringify({err:1,msg:"没有ID"});
            this.res.writeHead(200, { 'Content-Type': 'application/json' });
            this.res.write(data);
            this.res.end();
        }

        this.step(function(){

            var dTime = new Date()
            var _ym = dTime.getFullYear() + "-" + (dTime.getMonth()+1)

            var startTimeStamp = seed.startDate ? new Date(seed.startDate + " 00:00:00").getTime() : new Date(_ym+"-01 00:00:00").getTime();
            var endTimeStamp = seed.stopDate ? new Date(seed.stopDate + " 23:59:59").getTime() : new Date(_ym+"-31 23:59:59").getTime();
            nut.model.startDate = new Date(startTimeStamp+60*60*8*1000).toISOString().substr(0,10)
            nut.model.stopDate = new Date(endTimeStamp+60*60*8*1000).toISOString().substr(0,10)
            seed["$userList"] = {startDate:nut.model.startDate,stopDate:nut.model.stopDate,_id:seed._id,unwind:"lookbook"};
        })
    }
    , children: {

        userList: "lavico/userList.js"

    }
    , viewIn : function(){

        $('#startDate').datetimepicker({
            format: 'yyyy-mm-dd',
            autoclose: true,
            minView: 2
        });

        $('#stopDate').datetimepicker({
            format: 'yyyy-mm-dd',
            autoclose: true,
            minView: 2
        });

        jQuery("#tags").tagsManager({
            prefilled: [],
            hiddenTagListName: 'tagsVal'
        });

        $("#exportssd").attr("href","/lavico/userList:exports?unwind=lookbook&data=%7B%22name%22%3A%22%E5%90%8D%E7%A7%B0%22%2C%22createDate%22%3A%22%E6%94%B6%E8%97%8F%E6%97%B6%E9%97%B4%22%7D")
    }


}







