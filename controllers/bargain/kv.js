module.exports = {

    layout: "lavico/layout"
    , view: "lavico/templates/bargain/kv.html"

    , process: function(seed,nut)
    {
        var doc = {};
        nut.model.doc = doc

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

                        var url = process.wxOauth.getAuthorizeURL("http://"+this.req.headers.host+this.req.href,"123","snsapi_base")
                        console.log("通过oauth获得CODE的url",url)
                        this.res.writeHeader(302, {'location': url }) ;

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


        this.step(function(){

            if(wxid){
                helper.db.coll("lavico/bargain").find({"switcher":"on"}).toArray(this.hold(function(err,_doc){
                    doc = _doc || {}
                    nut.model.doc = doc
                }))

                helper.db.coll("welab/customers").findOne({wechatid:wxid},this.hold(function(err,customers){
                    var customers = customers || {}

                    nut.model.isVip = false
                    if(customers.HaiLanMemberInfo && customers.HaiLanMemberInfo.memberID && customers.HaiLanMemberInfo.action == "bind"){
                        nut.model.isVip = true
                    }
                }))
            }

        })


        this.step(function(){

            nut.model._id = seed._id || ""
            nut.model.wxid = wxid
        })
    }
}







