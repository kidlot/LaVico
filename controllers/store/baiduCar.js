
module.exports= {
    layout: "welab/layout",
    view: "lavico/templates/store/baiduCar.html",
    process: function (seed, nut) {
        nut.model.shopLng=seed.shopLng;//门店经度
        nut.model.shopLat=seed.shopLat;//门店纬度
        nut.model.address=seed.address;
        var lng,lat;

        this.step(function(){
            console.log(seed.wxid);
            helper.db.coll("welab/customers").findOne({"wechatid":seed.wxid},this.hold(function(err,doc){
                if(err) throw err;
                console.log("abc");
                if(doc){
                    if(doc.location!=null) {
                        console.log("aa");
                        nut.model.userLng = doc.location[1];
                        nut.model.userLat = doc.location[0];
                    }else{
                        console.log("bb");
                        nut.model.userLng="";
                        nut.model.userLat="";

                    }
                }
            }));
        })




    }
}