
module.exports= {
    layout: "welab/layout",
    view: "lavico/templates/store/baiduCar.html",
    process: function (seed, nut) {
        nut.model.shopLng=seed.shopLng;//门店经度
        nut.model.shopLat=seed.shopLat;//门店纬度
        var lng,lat;

        this.step(function(){
            helper.db.coll("welab/customers").findOne({"wechatid":seed.wxid},this.hold(function(err,doc){
                if(err) throw err;
                if(doc){
                    if(doc.location!=null) {
                        nut.model.userLng = doc.location[1];
                        nut.model.userLat = doc.location[0];
                    }else{
                        nut.model.userLng="";
                        nut.model.userLat="";
                    }
                }
            }));
        })



    }
}