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
            }));
        })

        this.step(function(){
            console.log(endTime)
            console.log(createTime())
            if(new Date(endTime).getTime()<new Date(createTime()).getTime()){
                if(isOpen==0){
                    nut.model.ok = "1";
                    nut.model.conent = "很抱歉，活动已结束"
                }else{
                    nut.model.ok = "1";
                    nut.model.conent = "很抱歉，活动已结束"
                }
            }
//            console.log("saas"+new Date(endTime).getTime())
//            console.log("sss:"+new Date(createTime()).getTime())
//            if(new Date(endTime).getTime()<new Date(createTime()).getTime()){
//                if(isOpen==0){
//                    nut.model.ok = "1";
//                    nut.model.conent = "很抱歉，活动已结束"
//                }
//            }else{
//                nut.model.ok = "1";
//                nut.model.conent = "很抱歉，活动已结束"
//            }
        })

        this.step(function(){
            if(new Date(beginTime).getTime()>new Date(createTime()).getTime()){
                //if(isOpen==0){
                    nut.model.ok = "3";
                    nut.model.conent = "很抱歉，活动未开始，敬请期待"
                //}
            }
        })

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
                    themeQuestion = doc.options;
                    themetype = doc.themeType;
                    nut.model.docs=doc;
                    nut.model.themetype = themetype;
                    nut.model.themeQuestion = JSON.stringify(doc);
                }
            }));
        })

        this.step(function(){
            helper.db.coll("lavico/custReceive").find({"themeId":helper.db.id(_id),"memberId":""+memberid,"wechatid":wechatid,
                "themetype":""+themetype,"isFinish":false} ).toArray(this.hold(function(err,result){
                if(err) throw err;
                if(result){
                    result_false = result;
                }
            }))
        })

        this.step(function(){
            helper.db.coll("lavico/custReceive").find({"themeId":helper.db.id(_id),"memberId":""+memberid,"wechatid":wechatid,
                "themetype":""+themetype,"isFinish":true} ).toArray(this.hold(function(err,result){
                if(err) throw err;
                if(result){
                    result_true = result;
                }
            }))
        })

        this.step(function(){
            console.log("result_false")
            console.log(result_false)
            if(result_false.length>0 && result_true.length==0){
                max = result_false[0].optionId;
                for(var i=0;i<result_false.length;i++){
                    console.log("max:"+max)
                    if(result_false[i].optionId>max){
                        max = result_false[i].optionId;
                        chooseId = result_false[i].chooseId;
                        console.log("result_false[i].chooseIDSS:"+result_false[i].chooseId)
                    }else{
                        max = result_false[i].optionId;
                        chooseId = result_false[i].chooseId;
                        console.log("result_false[i].chooseIDAA:"+result_false[i].chooseId)
                    }
                }
            }
            console.log("chooseId:"+chooseId)
        })

        this.step(function(){
            console.log("themeQuestion")
            console.log(themeQuestion)
            if(themeQuestion.length>0 && result_false.length>0){
                for(var i=0;i<themeQuestion.length;i++){
                    if(themeQuestion[i].optionId==max ){
                        chooseNextArr = themeQuestion[i].choose;
                    }
                }
            }
        })

        this.step(function(){
            console.log("chooseNextArr")
            console.log(chooseNextArr)
            if(chooseNextArr){
                for(var i=0;i<chooseNextArr.length;i++){
                    console.log("chooseNextArr[i].chooseID")
                    console.log(chooseNextArr[i].chooseID)
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
            helper.db.coll("lavico/custReceive").count({"themeId":helper.db.id(seed._id),"memberId":""+memberid,"isFinish":true},
                this.hold(function(err,doc){
                    if(err) throw err;
                    if(doc){
                        nut.model.isok = "0";
                    }else{
                        nut.model.isok = "1";
                    }
                })
            )
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