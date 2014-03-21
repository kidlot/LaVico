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
        }else{
            nut.disable();
            var data = JSON.stringify({err:1,msg:"没有微信ID"});
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

            nut.model.wxid = seed.wxid
            nut.model.doc = doc
        })

    }
}







