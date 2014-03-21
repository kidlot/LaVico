/**
 * 会员 - 我的会员卡 (已开卡状态)
 * 接口查询：会员卡号、卡类型、未使用的礼券、信息完善与否
 */

var middleware = require('lavico/lib/middleware.js');//引入中间件

module.exports = {
    layout:null,
    view:'lavico/templates/member/card_member/index.html',
    process:function(seed,nut){

        var defaultTestID = 'oBf_qJTu0Vn5nFlXFSVpCIbKIk8o';//设置默认测试微信ID
        var wxid = seed.wxid ? seed.wxid : defaultTestID;//预先定义微信ID
        this.req.session.wxid = wxid;//默认是30分钟失效期 SESSION

        nut.model.wxid = wxid;//设置模版的微信ID变量值

        /*
        * 其他会员页面WXID使用方法
        *  var wxid = seed.wxid ? seed.wxid : this.req.session.wxid;//预先定义微信ID
        *  if(wxid ==''){
        *       this.res.writeHead(302, {'location':'/lavico/member/index})
        *       this.res.end();
        *  }
        * */

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
        $('#info').click(function(){
            alert('hihi');
            window.location.href="/lavico/member/card_member/info?wxid="+wxid;//跳转到会员公告页面
        });

    }
}