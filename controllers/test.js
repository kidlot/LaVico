var middleware = require('lavico/controllers/m.js');//引入中间件
module.exports = {
    layout: null,
    view: null,
    process: function(seed,nut){
        var list = [];
        var AccessToken="";
        this.step(function(){
            helper.db.coll("welab/customers_copy").find({"nickname":null}).toArray(this.hold(function(err,doc){
                if(err) console.log("customers_err",err)
                if(doc){
                    list = doc;
                }
            }));
        })

        this.step(function(){
            middleware.getAccessToken(function(err,doc){
                if(err) console.log("AccessToken_err",err);
                console.log("AccessToken",doc)
                if(doc && doc.access_token){
                    AccessToken = doc.access_token;
                }
            })
        })

        this.step(function(){
            if(list.length>0){
                for(var i=0;i<list.length;i++){
                    (function(wxid,i){
                        middleware.getUserNickname(wxid,AccessToken,function(err,doc){
                            if(err){
                                console.log("err",err);
                            }
                            console.log("doc",doc)
                            if(doc && doc.nickname){
                                console.log("wechatid",wxid)
                                helper.db.coll("welab/customers_copy").update({"wechatid": wxid}, {$set: {
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
                    })(list[i].wechatid,i)
                }
            }

        })
    }
}

