/**
 * Created by David Xu on 3/12/14.
 */
/**
 * Created by David Xu on 3/12/14.
 * 会员解除绑定
 */
var middleware = require('lavico/lib/middleware.js');//引入中间件

module.exports = {

    layout:null
    ,view: 'lavico/templates/member/card_member/unbind.html'
    ,process:function(seed, nut){
        var wxid = seed.wxid ? seed.wxid : 'oBf_qJQ8nGyKu5vbnB1_u5okMT6Y';//预先定义微信ID
        nut.model.wxid = wxid ;
        // middleware.APPORBIND 申请，绑定
    }
    ,viewIn:function(){

    }
    ,actions:{
        unlock:{
            layout:null,
            view:null,
            process:function(seed,nut){
                //解除绑定
                nut.disabled = true ;
                var wxid = seed.wxid;
                var userCardNumber = seed.userCardNumber;
                var userTel = seed.userTel;
                var returnDoc = this;

                // 解除绑定
                data = '';
                returnDoc.res.writeHead(200, { 'Content-Type': 'application/json' });
                returnDoc.res.write(data);
                returnDoc.res.end();

            }
        }


    }

}