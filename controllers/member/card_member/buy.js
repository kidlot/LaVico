/**
 * Created by David Xu on 3/14/2014.
 * 会员 - 我的会员卡 - 消费记录
 * controllers/member/card_member/buy.js
 */

var middleware = require('lavico/lib/middleware.js');//引入中间件

module.exports = {
    layout:null,
    view:'lavico/templates/member/card_member/buy.html',
    process:function(seed, nut){
        var wxid = seed.wxid ? seed.wxid : 'oBf_qJQ8nGyKu5vbnB1_u5okMT6Y';//预先定义微信ID
        nut.model.wxid = wxid ;
    },
    viewIn:function(){

    }
}