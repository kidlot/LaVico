/**
 * 会员特权模版页面，白卡，vip卡，白金卡
*/

module.exports = {
    layout:'lavico/layout',
    view:'lavico/templates/member/benefit/weiCard.html',
    viewIn:function(){
        /*掩藏分享按钮*/
        window.hideShareButtion.on();
    },
    process:function(seed,nut){
    },
    actions:{
        weiCard:{
            layout:'lavico/layout',
            view:'lavico/templates/member/benefit/weiCard.html',
            process:function(seed,nut){
                var wxid = seed.wxid ? seed.wxid : 'undefined';//预先定义微信ID
                nut.model.wxid = wxid ;
            },
            viewIn:function(){
                $('#loading').hide();//隐藏加载框
            }
        },
        vipCard:{
            layout:'lavico/layout',
            view:'lavico/templates/member/benefit/vipCard.html',
            process:function(seed,nut){
                var wxid = seed.wxid ? seed.wxid : 'undefined';//预先定义微信ID
                nut.model.wxid = wxid ;
            },
            viewIn:function(){
                $('#loading').hide();//隐藏加载框
            }
        },
        goldCard:{
            layout:'lavico/layout',
            view:'lavico/templates/member/benefit/goldCard.html',
            process:function(seed,nut){
                var wxid = seed.wxid ? seed.wxid : 'undefined';//预先定义微信ID
                nut.model.wxid = wxid ;
            },
            viewIn:function(){
                $('#loading').hide();//隐藏加载框
            }
        }


    }
}


