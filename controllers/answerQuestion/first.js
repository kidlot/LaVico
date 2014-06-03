module.exports= {
    layout: "lavico/layout",
    view:"lavico/templates/answerQuestion/answer_num1.html",
    process:function(seed,nut){

        nut.model.wechatId=seed.wechatid;
        nut.model._id=seed.wechatid;
        var wechatid=seed.wechatid || undefined;
        nut.model.fromWelab = seed.fromWelab || ""
        var _id = seed._id;
        var memberid;

        this.step(function(){
            if(wechatid == undefined){
                if(this.req.session.oauthTokenInfo){
                    console.log("从SESSION中读取OPENID",this.req.session.oauthTokenInfo.openid)
                    wechatid = this.req.session.oauthTokenInfo.openid
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
                                    wechatid = openid || undefined;
                                    console.log("通过oauth获得信息",doc)
                                    this.req.session.oauthTokenInfo = doc;
                                }
                            }))
                        }
                    }
                }
            }
        })

        this.step(function(){
            console.log("wechatid:"+wechatid)
            if(wechatid != undefined){
                helper.db.coll('welab/customers').findOne({wechatid:wechatid},this.hold(function(err, doc){

                    console.log(doc)
                    var doc = doc || {};
                    console.log("doc:"+doc.isFollow)
                    nut.model.isFollow = doc.isFollow ? true : false;
                }));
            }else{
                nut.model.isFollow = false;
            }
        })


        this.step(function(){
            nut.model._id = seed._id || ""
            nut.model.wechatId = wechatid
        })



        this.step(function(){

            helper.db.coll("welab/customers").findOne({"wechatid":wechatid},this.hold(function(err,doc){
                if(err) throw err;

                if(doc && doc.HaiLanMemberInfo){
                    if(doc.HaiLanMemberInfo.action=='bind') {
                        memberid = doc.HaiLanMemberInfo.memberID;
                        nut.model.flag = "0";
                    }else{
                        memberid = doc.HaiLanMemberInfo.memberID;
                        nut.model.flag="1";
                    }
                }else{
                    //未绑定
                    memberid = "undefined";
                    nut.model.flag="1";
                }
                nut.model.memberid = memberid;
            }))
        })

        this.step(function(){
            helper.db.coll("lavico/themeQuestion").findOne({"_id":helper.db.id(seed._id)},this.hold(function(err,doc){
                if(err) throw err
                if(doc){
                    nut.model.docs=doc;
                    nut.model.themeQuestion = JSON.stringify(doc);
                }
            }));
        })

        this.step(function(){
            //if(memberid!="undefined"){
                helper.db.coll("lavico/custReceive").count({"themeId":helper.db.id(seed._id),"memberId":""+memberid},this.hold(function(err,doc){
                    if(err) throw err;
                    if(doc){
                        nut.model.isok = "0";
                    }else{
                        nut.model.isok = "1";
                    }
                }))

           // }else{
                //nut.model.isok = "1";
            //}
        })

    }

}