/**
 * 会员 - 我的会员卡 (已开卡状态)
 * 接口查询：会员卡号、卡类型、未使用的礼券、信息完善与否
 */

var middleware = require('lavico/lib/middleware.js');//引入中间件

module.exports = {
    layout:null,
    view:'lavico/templates/member/card_member/index.html',
    process:function(seed,nut){
        var wxid = seed.wxid ? seed.wxid : 'oBf_qJQ8nGyKu5vbnB1_u5okMT6Y';//预先定义微信ID
        nut.model.wxid = wxid;
        //根据WXID来判断会员的类型
        //判断会员接口
        //返回值 type = card_blank || card_member

    },
    viewIn:function(){
        var wxid = $('#wxid').val();
        $('#announcement').click(function(){
            window.location.href="/lavico/member/card_member/announcement/index?wxid="+wxid;//跳转到会员公告页面
        });
        $('#coupon').click(function(){
            window.location.href="/lavico/member/card_member/coupon/index?wxid="+wxid;//跳转到会员公告页面
        });
        $('#points').click(function(){
            window.location.href="/lavico/member/card_member/points/index?wxid="+wxid;//跳转到会员公告页面
        });
        $('#buy').click(function(){
            window.location.href="/lavico/member/card_member/buy?wxid="+wxid;//跳转到会员公告页面
        });
        $('#fav').click(function(){
            window.location.href="/lavico/member/card_member/fav?wxid="+wxid;//跳转到会员公告页面
        });

    }
}