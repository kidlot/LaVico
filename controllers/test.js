var middleware = require('lavico/lib/middleware.js');//引入中间件
module.exports = {
    layout: null,
    view: null,
    process: function(seed,nut){
        var list = [];
        this.step(function(){
            helper.db.coll("welab/customers_copy").find({"nickname":null}).toArray(this.hold(function(err,doc){
                if(err) console.log("customers_err",err)
                if(doc){
                    list = doc;
                }
            }));
        })

        this.step(function(){
            if(list.length>0){
                for(var i=0;i<list.length;i++){
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


                        process.wxOauth.getUser(list[i].wechatid,function(err,doc){
                            if(err){
                                console.log("err",err);
                            }
                            console.log("doc",doc)
                            if(doc){
                                helper.db.coll("welab/customers_copy").update({wechatid: wechatid}, {$set: {
                                    userName: doc.nickname,
                                    nickname: doc.nickname,
                                    gender: doc.sex,
                                    language: doc.language,
                                    city: doc.city,
                                    province: doc.province,
                                    country: doc.country,
                                    face: doc.headimgurl
                                }}, {upsert: true}, function (err, doc) {
                                    err && console.log(err)
                                })
                            }
                        })
                    }else{
                        console.log("1111111111")
                    }

                }
            }

        })
    }
}

