var middleware = require('../lib/middleware.js');

module.exports = {

	layout: null
	, view: "tishman/templates/index.html"

    , process: function(seed,nut)
    {


        // middleware.APPORBIND 申请，绑定
        middleware.request( middleware.APPORBIND,{
            BRAND_CODE:"00011", //品牌编号
            MIC_ID:"", //微信账号ID
            MEM_APP_NO:"", //申请单号
            TYPE:"0", //0：新会员申请，1：老会员绑定
            MEM_PSN_CNAME:"", //会员姓名
            MEM_PSN_SEX:"", //性别 0：女，1：男
            MEM_PSN_BIRTHDAY:"2012-11-11", //生日
            MOBILE_TELEPHONE_NO:"", //手机号
            MEM_OLDCARD_NO:"" //老卡编号
        },function(err,doc){
            console.log(doc)
        })

    }


}







