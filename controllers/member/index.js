/**
 * Created by David Xu on 3/17/14.
 * 进入会员管理页面，首先先进入本页面，然后根据不同类型的会员进入不同的页面 card_blank/index or card_member/index
 */

var middleware = require('lavico/lib/middleware.js');//引入中间件

module.exports = {
    layout:null,
    view:null,
    process:function(seed,nut){
        var wxid = seed.wxid ? seed.wxid : 'oBf_qJQ8nGyKu5vbnB1_u5okMT6Y';//预先定义微信ID
        nut.model.wxid = wxid;
        //根据WXID来判断会员的类型
        //判断会员接口
        //返回值 type = card_blank || card_member
        var type = 'card_blank';
        if(type == "card_blank"){
            this.res.writeHead(302, {'location':'/lavico/member/card_blank/index?wxid='+wxid})
            //跳转 lavico/member/card_blank/index
        }else if(type == 'card_member'){
            this.res.writeHead(302, {'location':'/lavico/member/card_member/index?wxid='+wxid})
            //跳转 lavico/memeber/card_blank/index
        }else{
            this.res.writeHead(302, {'location':'/lavico/index?wxid='+wxid})
            //返回错误Error
            //跳转到 lavico/index
        }
        this.res.end();

    },
    viewIn:function(){
    }
}