var middleware = require('lavico/lib/middleware.js');//引入中间件

module.exports = {

    layout: "lavico/layout"
	, view: "lavico/templates/bargain/maps.html"

    , process: function(seed,nut)
    {
        var doc = {};

        if(seed._id){

            nut.model.wxid = seed.wxid
            nut.model._id = seed._id
            var doc

            helper.db.coll("lavico/bargain").findOne({_id:helper.db.id(seed._id)},this.hold(function(err,_doc){
                doc = _doc || {}
            }))

            this.step(function(){
                doc.shops2 = []
                //shops
                middleware.request( "Shops",
                    {perPage:1000},
                    this.hold(function(err,shoplist){
                        var _shops = JSON.parse(shoplist)

                            for(var i=0 ; i< _shops.list.length ;i ++){
                                for(var ii=0 ; ii< doc.maps.length ;ii ++){
                                    if(_shops.list[i].CODE.replace(/\s*/g, '') == doc.maps[ii]){
                                        doc.shops2.push({name:_shops.list[i].NAME,address:_shops.list[i].ADDR,tel:_shops.list[i].TEL,CODE:_shops.list[i].CODE})
                                    }
                                }
                            }
                }));
            })


            this.step(function(){

                console.log(doc)
                nut.model.doc = doc
            })

        }else{
            nut.disable();
            var data = JSON.stringify({err:1,msg:"没有产品ID"});
            this.res.writeHead(200, { 'Content-Type': 'application/json' });
            this.res.write(data);
            this.res.end();
        }


    }
}







