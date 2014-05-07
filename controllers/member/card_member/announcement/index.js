/**
 * 会员公告页面
 *
 * */

var middleware = require('lavico/lib/middleware.js');//引入中间件

module.exports = {
    layout:null,
    view:'lavico/templates/member/card_member/announcement/index.html',
    process:function(seed,nut){
        var wxid = seed.wxid ? seed.wxid : 'oBf_qJQ8nGyKu5vbnB1_u5okMT6Y';//预先定义微信ID
        nut.model.wxid = wxid;

    },
    viewIn:function(){

    }
}