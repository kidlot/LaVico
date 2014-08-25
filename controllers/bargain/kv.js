var middleware = require('lavico/lib/middleware.js');//引入中间件
module.exports = {

    layout: "lavico/layout"
    , view: "lavico/templates/bargain/kv.html"

    , process: function(seed,nut)
    {
        if(this.req){
            //this.req.now
        }

        var doc = {};

        nut.model.fromWelab = seed.fromWelab || ""

        var wxid = seed.wxid;

        if(!wxid || wxid == '{wxid}'){

            if(this.req.session.oauthTokenInfo && this.req.session.oauthTokenInfo.openid){

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
                                wxid = openid || undefined;
                                console.log("通过oauth获得信息",doc)
                                this.req.session.oauthTokenInfo = doc.data;
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
                helper.db.coll("lavico/bargain").find({"switcher":"on",startDate:{$lt:new Date().getTime()},stopDate:{$gt:new Date().getTime()}}).toArray(this.hold(function(err,_doc){
                    if(err) throw err;
                    doc = _doc || {}
                    //console.log(doc);
                }))
            }

        })

        this.step(function(){

            helper.db.coll("lavico/bargain/kv").find({"type":"kv"}).toArray(this.hold(function(err,_doc){
                if(err) throw err;
                if(_doc.length > 0){
                    doc.description = decodeURIComponent(_doc[0].description).replace(/\{\@(.?wxid)\}/g, wxid);
                    doc.pic_kv = _doc[0].pic_kv || '/lavico/public/images/bargain_banner.jpg';//设置默认的kv图
                }
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
        })


        this.step(function(){

            nut.model._id = seed._id || ""
            nut.model.wxid = wxid
            nut.model.doc = doc || {}
        })
    }
}





