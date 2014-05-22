
module.exports= {
    layout: null,
    view: "lavico/templates/store/baiduCar.html",
    process: function (seed, nut) {
        nut.model.shopLng=seed.shopLng;//门店经度
        nut.model.shopLat=seed.shopLat;//门店纬度
        //用户坐标
        nut.model.userLng=this.req.session.userLng;
        nut.model.userLat=this.req.session.userLat;
    }
}