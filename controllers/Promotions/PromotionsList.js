var middleware = require('lavico/lib/middleware.js');//引入中间件
moudle.exports={
    layout:null,
    view:"lavico/templates/promotionsList/promotionsList.html",
    process:function(seed,nut){
        middleware.request("/lavico.middleware/Promotions",this.hold(function(){
            var dataJson = JSON.parse(doc);

        }));
    }
}