var middleware = require('lavico/lib/middleware.js');//引入中间件
module.exports = {

    layout: "lavico/layout"
    , view: "lavico/templates/bargain/kv.html"

    , process: function(seed,nut)
    {
        var doc = {};

        nut.model.fromWelab = seed.fromWelab || ""

        var wxid = seed.wxid;

        if(!wxid){

            if(this.req.session.oauthTokenInfo){

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
                                var openid = doc.openid
                                wxid = openid || undefined;
                                console.log("通过oauth获得信息",doc)
                                this.req.session.oauthTokenInfo = doc;
                            }
                        }))
                    }

                }
            }
        }


        /*
        检查是否关注
         */

        this.step(function(){

            if(wxid){
                helper.db.coll("lavico/bargain").find({"switcher":"on"}).toArray(this.hold(function(err,_doc){
                    if(err) throw err;
                    if(_doc){
                        for(var i=0;i<_doc.length;i++){
                            _doc[i].description = decodeURIComponent(_doc[i].description).replace(/\{\@(.?wxid)\}/g, wxid);
                        }
                    }
                    doc = _doc || {}
                    nut.model.doc = doc
                }))

                helper.db.coll("welab/customers").findOne({wechatid:wxid},this.hold(function(err,customers){
                    var customers = customers || {}

                    nut.model.isVip = false
                    nut.model.isFollow = customers.isFollow ? true : false;
                    if(customers.HaiLanMemberInfo && customers.HaiLanMemberInfo.memberID && customers.HaiLanMemberInfo.action == "bind"){
                        nut.model.isVip = true
                        nut.model.memberID = customers.HaiLanMemberInfo.memberID
                    }
                }))
            }

        })


//        nut.model.bargainStatus = "";
//
//        // 查询剩余积分
//        this.step(function(){
//
//            var then = this;
//            nut.model.jf = 0;
//
//            if(nut.model.doc.length > 0){
//
//                nut.model.jf = nut.model.doc[0].deductionIntegral || 0;
//
//                if(nut.model.doc[0].deductionIntegral){
//
//                    middleware.request("Point/" + nut.model.memberID,
//                        {memberId: nut.model.memberID},
//                        this.hold(function (err, doc) {
//
//                            console.log("剩余积分",doc)
//                            if(parseInt(JSON.parse(doc).point) < parseInt(nut.model.doc[0].deductionIntegral)){
//
//                                nut.model.bargainStatus = "您的积分不够了，快去朗维高门店消费或者参加抢积分活动吧！"
//                            }
//                        }));
//                }
//            }
//        })



        this.step(function(){

            nut.model._id = seed._id || ""
            nut.model.wxid = wxid
        })
    }
}





