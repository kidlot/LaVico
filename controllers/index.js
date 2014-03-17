var middleware = require('../lib/middleware.js');

module.exports = {

	layout: null
	, view: "tishman/templates/index.html"

    , process: function(seed,nut)
    {


        //http://222.191.239.90:8080/lavico.middleware/Member?openid=1234&MEM_PSN_CNAME=alee&MEM_PSN_SEX=1&MOBILE_TELEPHONE_NO=18812341235&MEM_PSN_BIRTHDAY=1982-10-11
        middleware.request( "/lavico.middleware/Member",{
            openid:'1111111'
        },function(err,doc){
            console.log(doc)
        })

    }


}







