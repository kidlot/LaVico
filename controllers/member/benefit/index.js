/**
*/

module.exports = {
    layout:'lavico/member/layout',
    view:'lavico/templates/member/benefit/weiCard.html',
    process:function(seed,nut){
    },
    actions:{
        weiCard:{
            layout:'lavico/member/layout',
            view:'lavico/templates/member/benefit/weiCard.html',
            process:function(seed,nut){
                var wxid = seed.wxid ? seed.wxid : 'undefined';//预先定义微信ID
                nut.model.wxid = wxid ;
            }
        },
        vipCard:{
            layout:'lavico/member/layout',
            view:'lavico/templates/member/benefit/vipCard.html',
            process:function(seed,nut){
                var wxid = seed.wxid ? seed.wxid : 'undefined';//预先定义微信ID
                nut.model.wxid = wxid ;
            }
        },
        goldCard:{
            layout:'lavico/member/layout',
            view:'lavico/templates/member/benefit/goldCard.html',
            process:function(seed,nut){
                var wxid = seed.wxid ? seed.wxid : 'undefined';//预先定义微信ID
                nut.model.wxid = wxid ;
            }
        }


    }
}


