
module.exports= {
    layout: null,
    view: "lavico/templates/store/baiduCar.html",
    process: function (seed, nut) {
        nut.model.shopLng=seed.shopLng;//门店经度
        nut.model.shopLat=seed.shopLat;//门店纬度

        this.step(function(){
            helper.db.coll("welab/customers").findOne({"wechatid":seed.wxid},this.hold(function(err,doc){
                if(err) throw err;
                if(doc){
                    var lng=doc.location[0];
                    var lat=doc.location[1];


                }
            }));
        })


    }
}