/**
 * Created by David Xu on 3/14/2014.
 * 会员 - 我的会员卡 - 收藏清单
 * controllers/member/card_member/info.js
 */

var middleware = require('lavico/lib/middleware.js');//引入中间件

module.exports = {
    layout:null,
    view:'lavico/templates/member/card_member/info.html',
    process:function(seed, nut){
        var wxid = seed.wxid ? seed.wxid : '1237';//预先定义微信ID
        nut.model.wxid = wxid ;
    },
    viewIn:function(){

    }
}