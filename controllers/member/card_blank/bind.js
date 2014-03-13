/**
 * Created by David Xu on 3/12/14.
 * 会员解除绑定
 */
var middleware = require('lavico/lib/middleware.js');//引入中间件

module.exports = {

    layout:null
    ,view: 'lavico/templates/member/card_blank/bind.html'
    ,process:function(seed, nut){
        var wxid = seed.wxid ? seed.wxid : 'oBf_qJQ8nGyKu5vbnB1_u5okMT6Y';//预先定义微信ID
        nut.model.wxid = wxid ;
    }
    ,viewIn:function(){

    }
    ,actions:{

        save:{

                process:function(seed,nut){

                    var wxid = seed.wxid;
                    var userCardNumber = seed.userCardNumber;
                    var userName = seed.userName;
                    var userTel = seed.userTel;

                    // middleware.APPORBIND 申请，绑定
                    middleware.request( middleware.APPORBIND,{
                        BRAND_CODE:"L", //品牌编号
                        MIC_ID:wxid, //微信账号ID
                        MEM_APP_NO:"LS", //申请单号
                        TYPE:"1", //0：新会员申请，1：老会员绑定
                        MEM_PSN_CNAME:userName, //会员姓名
                        MEM_PSN_SEX:"1", //性别 0：女，1：男
                        MEM_PSN_BIRTHDAY:"2012-11-11", //生日
                        MOBILE_TELEPHONE_NO:userTel, //手机号
                        MEM_OLDCARD_NO:userCardNumber //老卡编号
                        //6226 0458 3697 4321
                    },function(err,doc){
                        return doc;
                    })

                    //6226045836974321
                }
        }
    }
}