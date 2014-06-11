
module.exports= {
    layout: null,
    view: null,
//    layout: "welab/layout",
//    view: "lavico/templates/store/baiduCar.html",
    process: function (seed, nut) {
        nut.model.shopLng=seed.shopLng;//门店经度
        nut.model.shopLat=seed.shopLat;//门店纬度
        nut.model.address=seed.address;
        var shopLng = seed.shopLng ? seed.shopLng : null;
        var shopLat = seed.shopLat ? seed.shopLat : null;
        var address = seed.address ? seed.address : null;
        var lng,lat;
        var userLng="";
        var userLat="";

        this.step(function(){
            helper.db.coll("welab/customers").findOne({"wechatid":seed.wxid},this.hold(function(err,doc){
                if(err) throw err;
                if(doc){
                    if(doc.location!=null) {
                        userLng = doc.location[1];
                        userLat = doc.location[0];
                        nut.model.userLng = doc.location[1];
                        nut.model.userLat = doc.location[0];
                    }else{
                        userLng="";
                        userLat="";
                        nut.model.userLng="";
                        nut.model.userLat="";
                    }
                }
            }));
        });

        this.step(function(){
            console.log("userLat:"+userLat)
            console.log("userLng:"+userLng)
            console.log("shopLat:"+shopLat)
            console.log("shopLng:"+shopLng)
            console.log("address:"+address)
            if(shopLng!=null){
//                this.res.writeHead(302,{"http://api.map.baidu.com/direction?region=ss&origin=latlng:" +
//                    userLat +"," +userLng +"|name:您所在位置&destination=latlng:" +shopLat +"," +shopLng +"|name:LaVico专柜&mode=driving&output=html&src=yourCompanyName|yourAppName"})
//                this.res.end();
            }else{
                this.res.writeHead(302,{"http://api.map.baidu.com/geocoder?address=sadsad&output=html&src=yourCompanyName|yourAppName"});
                this.res.end();
            }
        })

    }
}