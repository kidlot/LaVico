module.exports = {

	layout: null
	, view: "lavico/templates/bargain/detail.html"

    , process: function(seed,nut)
    {
        var doc = {};

        if(seed.wxid && seed._id){

            helper.db.coll("lavico/bargain").findOne({startDate:{$lte:new Date().getTime()},stopDate:{$gte:new Date().getTime()},_id:helper.db.id(seed._id)},this.hold(function(err,_doc){
                doc = _doc || {}
            }))
        }else{
            nut.disable();
            var data = JSON.stringify({err:1,msg:"没有微信ID或产品ID"});
            this.res.writeHead(200, { 'Content-Type': 'application/json' });
            this.res.write(data);
            this.res.end();
        }

        this.step(function(){

            nut.model.isTimeOut = false
            var timeout = 60 * 10 * 1000
            if( this.req.session._bargain_lastTime + timeout > new Date().getTime()){
                nut.model.isTimeOut = true
            }


//            var timeout = 60 * 60 * 24 * 1000
//            if( this.req.session._bargain_lastDealTime + timeout > new Date().getTime()){
//                nut.model.isTimeOut = true
//            }

            nut.model.wxid = seed.wxid
            nut.model.doc = doc
        })

    }
}







