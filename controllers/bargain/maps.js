module.exports = {

	layout: null
	, view: "lavico/templates/bargain/maps.html"

    , process: function(seed,nut)
    {
        var doc = {};

        if(seed._id){

            nut.model.wxid = seed.wxid
            nut.model._id = seed._id

            helper.db.coll("lavico/bargain").findOne({startDate:{$lte:new Date().getTime()},stopDate:{$gte:new Date().getTime()},_id:helper.db.id(seed._id)},this.hold(function(err,_doc){
                doc = _doc || {}
                nut.model.doc = doc
            }))
        }else{
            nut.disable();
            var data = JSON.stringify({err:1,msg:"没有产品ID"});
            this.res.writeHead(200, { 'Content-Type': 'application/json' });
            this.res.write(data);
            this.res.end();
        }


    }
}







