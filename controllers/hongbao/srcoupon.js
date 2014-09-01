var middleware = require('../../lib/middleware.js');
module.exports = {

    layout: null
    , view: "lavico/templates/pintu/srcoupon.html"

    , process: function(seed,nut)
    {
	var wxid = seed.wxid;
        this.step(function(){
            //oauth认证
            if(!wxid){

                if(1==2){
                    console.log("从SESSION中读取OPENID",this.req.session.oauthTokenInfo.openid)
                    wxid = this.req.session.oauthTokenInfo.openid
                }else{
                    // 通过oauth获取OPENID
                    if(process.wxOauth){

                        if(!seed.code){

                            var url = process.wxOauth.getAuthorizeURL("http://"+this.req.headers.host+this.req.url,"123","snsapi_base")
                            console.log("通过oauth获得CODE的url",url)
                            this.res.writeHeader(302, {'location': url }) ;

                            nut.disable();//不显示模版
                            this.res.end();
                            this.terminate();

                        }else{

                            process.wxOauth.getAccessToken(seed.code,this.hold(function(err,doc){

                                if(!err){
                                    var openid = doc.data.openid
                                    wxid = openid || "undefined";
                                    console.log("通过oauth获得信息",doc)
                                    this.req.session.oauthTokenInfo = doc;
                                }
                            }))
                        }

                    }
                }
            }
        });


        var doc = {};

        nut.model.fromWelab = seed.fromWelab || ""


	var COUPON_NO = null;
	//获取用户得到的丝绒券
	

	
	
        this.step(function(){
		helper.db.coll("lavico/pintu/gift").findOne({sharewxid:wxid,is_get:true},this.hold(function(err,doc){
		if(doc){
			middleware.request('Coupon/GetCouponsForOpenid',{
			    openid:wxid,
			    PROMOTION_CODE:'CQL201408080020'
			},this.hold(function(err,doc){
				if(!err){
					console.log(doc);
					doc = eval("("+doc+")");
					console.log(doc.list[0].COUPON_NO);
					COUPON_NO = doc.list[0].COUPON_NO;
					nut.model.COUPON_NO = COUPON_NO;
					console.log(COUPON_NO);
				}
			}))
				
		}
		
		}))

	
	
	})

        /*
        检查是否关注
         */


        this.step(function(){

            nut.model._id = seed._id || ""
            nut.model.wxid = wxid
            nut.model.doc = doc || {}
        })
    }
}





