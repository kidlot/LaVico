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
        var themetype;
        var result_false;
        var isok = true;
        var max;
        var chooseNext;
        var themeQuestion;
        var chooseId=0;
        var chooseNextArr;
        var result_true;
        var beginTime="",endTime="",isOpen="";
        var pram;

        nut.model.ok = "0";
        nut.model.conent = "undefined"

        this.step(function(){
            //判断活动是否开启或到期1-1
            helper.db.coll("lavico/themeQuestion").findOne({"_id":helper.db.id(_id)},this.hold(function(err,doc){
                if(err)throw err;
                beginTime=doc.beginTime;
                endTime=doc.endTime;
                isOpen=doc.isOpen;
                nut.model.themeType = doc.themeType;
                nut.model.themequestion = JSON.stringify(doc.options);

                nut.model.description = decodeURIComponent(doc.description);
                nut.model.relief = decodeURIComponent(doc.relief);
                nut.model.explanation = decodeURIComponent(doc.explanation).replace(/\{\@(.?wxid)\}/g, wechatid);
                if(doc.pic && doc.pic!="null" && typeof(doc.pic)!="undefined"){
                    nut.model.pic = doc.pic;
                }else{
                    nut.model.pic = "undefined";
                }

            }));
        })

        this.step(function(){
            if(new Date(endTime).getTime()<new Date(createTime()).getTime()){
                if(isOpen==0){
                    nut.model.ok = "1";
                    nut.model.conent = "很抱歉，活动已结束"
                }else{
                    nut.model.ok = "1";
                    nut.model.conent = "很抱歉，活动已结束"
                }
            }
        })

        this.step(function(){
            if(new Date(beginTime).getTime()>new Date(createTime()).getTime()){
                nut.model.ok = "3";
                nut.model.conent = "很抱歉，活动未开始，敬请期待"
            }
        })

        this.step(function(){
            if(wechatid == undefined || wechatid == '{wxid}'){
                if(this.req.session.oauthTokenInfo && this.req.session.oauthTokenInfo.openid){
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
                                    var openid = doc.data.openid
                                    wechatid = openid || undefined;
                                    console.log("通过oauth获得信息",doc)
                                    this.req.session.oauthTokenInfo = doc.data;
                                }
                            }))
                        }
                    }
                }
            }
        })

        this.step(function(){
            if(wechatid != undefined){
                helper.db.coll('welab/customers').findOne({wechatid:wechatid},this.hold(function(err, doc){
                    var doc = doc || {};
                    nut.model.isFollow = doc.isFollow ? true : false;
                }));
            }else{
                nut.model.isFollow = false;
            }
        })

        this.step(function(){
            nut.model._id = seed._id || ""
            nut.model.wechatId = wechatid
            nut.model.wxid = wechatid
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
                }else if(doc){
                    nut.model.follow = doc.isFollow;
                    //未绑定
                    memberid = "undefined";
                    nut.model.flag="1";
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
                    themeQuestion = doc.options;
                    themetype = doc.themeType;
                    nut.model.docs=doc;
                    nut.model.pram = doc.pram;
                    pram = doc.pram;
                    nut.model.themetype = themetype;
                    nut.model.themeQuestion = JSON.stringify(doc);
                }
            }));
        })

        this.step(function(){
            if(memberid =="undefined"){
                helper.db.coll("lavico/custReceive").find({"themeId":helper.db.id(_id),"wechatid":wechatid,
                    "themetype":""+themetype,"isFinish":false} ).toArray(this.hold(function(err,result){
                        if(err) throw err;
                        if(result){
                            result_false = result;
                        }
                    }))
            }else{
                helper.db.coll("lavico/custReceive").find({"themeId":helper.db.id(_id),"memberId":""+memberid,"wechatid":wechatid,
                    "themetype":""+themetype,"isFinish":false} ).toArray(this.hold(function(err,result){
                        if(err) throw err;
                        if(result){
                            result_false = result;
                        }
                    }))
            }

        })

        this.step(function(){

            if(memberid =="undefined"){
                helper.db.coll("lavico/custReceive").find({"themeId":helper.db.id(_id),"wechatid":wechatid,
                    "themetype":""+themetype,"isFinish":true} ).toArray(this.hold(function(err,result){
                        if(err) throw err;
                        if(result){
                            result_true = result;
                        }
                    }))
            }else{
                helper.db.coll("lavico/custReceive").find({"themeId":helper.db.id(_id),"memberId":""+memberid,"wechatid":wechatid,
                    "themetype":""+themetype,"isFinish":true} ).toArray(this.hold(function(err,result){
                        if(err) throw err;
                        if(result){
                            result_true = result;
                        }
                    }))
            }

        })

        this.step(function(){
            if(result_false.length>0 && result_true.length==0){
                max = result_false[0].optionId;
                for(var i=0;i<result_false.length;i++){
                    if(result_false[i].optionId>max){
                        max = result_false[i].optionId;
                        chooseId = result_false[i].chooseId;
                    }else{
                        max = result_false[i].optionId;
                        chooseId = result_false[i].chooseId;
                    }
                }
            }
        })

        this.step(function(){
            if(themeQuestion.length>0 && result_false.length>0){
                for(var i=0;i<themeQuestion.length;i++){
                    if(themeQuestion[i].optionId==max ){
                        chooseNextArr = themeQuestion[i].choose;
                    }
                }
            }
        })

        this.step(function(){
            if(chooseNextArr){
                for(var i=0;i<chooseNextArr.length;i++){
                    if(chooseNextArr[i].chooseID==chooseId){
                        chooseNext = chooseNextArr[i].chooseNext
                    }
                }
            }else{
                chooseNext = "-1";
            }
            if(chooseNext==""){
                chooseNext = parseInt(max)+1
            }
            nut.model.choose = chooseNext;
        })

        this.step(function(){
            console.log("memberid",memberid)

            if(memberid=="undefined"){
                console.log("action","1")
                console.log("memberId",memberId)
                console.log("memberId",typeof memberId)
                console.log("wechatid",wechatid)
                console.log("wechatid",typeof wechatid)
                console.log("ut.model.themeType",nut.model.themeType)
                console.log("ut.model.themeType",typeof nut.model.themeType)
                helper.db.coll("lavico/custReceive").find({"themeId":helper.db.id(_id),"wechatid":wechatid,
                    "themetype":""+nut.model.themeType,"isFinish":true}).toArray(this.hold(function(err,result){
                        if(err) throw err;
                        console.log("result_1",result)
                        if(result && result.length>0){
                            nut.model.isok = "1";
                        }else{
                            nut.model.isok = "0";
                        }
                    }))
            }else if(memberid!="undefined"){
                console.log("action","2")
                console.log("memberId",memberId)
                console.log("memberId",typeof memberId)
                console.log("wechatid",wechatid)
                console.log("wechatid",typeof wechatid)
                console.log("ut.model.themeType",nut.model.themeType)
                console.log("ut.model.themeType",typeof nut.model.themeType)
                helper.db.coll("lavico/custReceive").find({"themeId":helper.db.id(_id),"memberId":""+memberid,"wechatid":wechatid,
                    "themetype":""+nut.model.themeType,"isFinish":true}).toArray(this.hold(function(err,result){
                        if(err) throw err;
                        console.log("result_2",result)
                        if(result && result.length>0){
                            nut.model.isok = "1";
                        }else{
                            nut.model.isok = "0";
                        }
                    }))
            }else{
                console.log("action","3")
                nut.model.isok = "0";
            }
        })
    }
}

function createTime(){
    var d = new Date();
    var vYear = d.getFullYear();
    var vMon = d.getMonth() + 1;
    var vDay = d.getDate();
    s=vYear+"-"+(vMon<10 ? "0" + vMon : vMon)+"-"+(vDay<10 ? "0"+ vDay : vDay);
    return s;
}