/**
 * Created by David Xu on 3/14/2014.
 * 专属礼券 之 详细介绍页面
 * 使用细则由后台编辑，含图片
 */
var middleware = require('lavico/lib/middleware.js');//引入中间件


module.exports = {
    layout: "lavico/member/layout",
    view: "lavico/templates/member/card_member/coupon/rule.html",
    process: function (seed, nut) {
        var wxid = seed.wxid;
        nut.model.wxid = wxid;
    },
    viewIn:function(){
        $('#loading').hide();//隐藏加载框
    }
}