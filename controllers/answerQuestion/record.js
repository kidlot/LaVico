var middleware = require('lavico/lib/middleware.js');//引入中间件
module.exports={
    layout:null,
    view:null,
    process:function(seed,nut){
        var then=this;
        var type=seed.type;//题目类型
        var optionId=seed.optionId;//选题ID
        var _id=seed._id;//大题目ID
        var chooseId=seed.chooseId;//选项编号
        var score=seed.score;//所获分值
        var chooseNext=seed.chooseNext;//下一题/标签
        var wechatid=seed.wechatid;//微信ID
        var finish=seed.finish;//是否为“完成”按钮 true
        var stopLabel=seed.stopLabel;//停止标签
        var customerLabel=seed.customerLabel;//自定义标签
        var memberid=seed.memberid || "undefined";
        var docvar=null;//是否已经有存储,即，是否已经做过此题
        var themetype = seed.themetype;
        //判断是否是下一题或完成按钮
        var status = seed.status ? seed.status : "false";

        console.log("score",score)
        var themeQuestion_doc;
        var parm;
        this.step(function(){
            //判断是否已经记录
            helper.db.coll("lavico/custReceive").findOne({"themeId":helper.db.id(_id),
                "wechatid":wechatid,"optionId":parseInt(optionId),"memberId":memberid},this.hold(function(err,doc){
                docvar=doc;
            }))});

        this.step(function(){
            //异常情况判断：是否填写的数值大于当前题目数
            helper.db.coll("lavico/themeQuestion").findOne({"_id":helper.db.id(_id)},then.hold(function(err,doc){
                if(err) throw err;
                if(doc){
                    themeQuestion_doc = doc;
                    parm = doc.parm;
                    if(optionId>doc.options.length){
                        nut.view.disable();
                        nut.write("<script>window.onload=function(){window.popupStyle2.on('无此题，请联系管理员',function(event){history.back()})}</script>");
                    }
                    return doc.options;
                }
            }));
        })

        this.step(function(docOptions){
            //竞猜型
            if(themetype==3){
                if(type==0){
                    //记录选项
                    if(!isNaN(score)){
                        //session累加
                        var scores=0;
                        if(isNaN(parseInt(score))){
                            scores=0
                        }else{
                            scores=parseInt(score)
                            then.req.session.scoreAll+=parseInt(score);
                        }
                        //记录积分
                        if(memberid =="undefined"){
                            helper.db.coll("lavico/custReceive").update({"themeId":helper.db.id(_id),"type":type,
                                    "themetype":themetype,"optionId":parseInt(optionId)},
                                {$set: {
                                    "wechatid": wechatid,
                                    "themeId": helper.db.id(_id),
                                    "isFinish": false,
                                    "optionId": parseInt(optionId),
                                    "chooseId": parseInt(chooseId),
                                    "getChooseScore": scores,
                                    "getChooseLabel":"",
                                    "getLabel": "",
                                    "getGift":  "",
                                    "getScore": "",
                                    "type":type,
                                    "createTime": new Date().getTime(),
                                    "memberId":"",
                                    "themetype":themetype
                                }}, {upsert: true},function(err,doc){
                                    if(err) throw err;
                                    console.log(doc)
                                })
                        }else{
                            helper.db.coll("lavico/custReceive").update({"themeId":helper.db.id(_id),"type":type,
                                    "themetype":themetype,"memberId":""+memberid,"optionId":parseInt(optionId)},
                                {$set: {
                                    "wechatid": wechatid,
                                    "themeId": helper.db.id(_id),
                                    "isFinish": false,
                                    "optionId": parseInt(optionId),
                                    "chooseId": parseInt(chooseId),
                                    "getChooseScore": scores,
                                    "getChooseLabel":"",
                                    "getLabel": "",
                                    "getGift":  "",
                                    "getScore": "",
                                    "type":type,
                                    "createTime": new Date().getTime(),
                                    "memberId":memberid,
                                    "themetype":themetype
                                }}, {upsert: true},function(err,doc){
                                    if(err) throw err;
                                    console.log(doc)
                                })
                        }

                    }
                    if(then.req.session.customerLabel && then.req.session.customerLabel.indexOf(customerLabel)<0){
                        if(then.req.session.customerLabel){
                            then.req.session.customerLabel+=","+customerLabel;
                        }else{
                            then.req.session.customerLabel=customerLabel;
                        }
                    }else{
                        then.req.session.customerLabel=customerLabel;
                    }
                  //  if(memberid && memberid !="undefined"){

                        var memoString = themeQuestion_doc.theme +"--"+ customerLabel;
                        jsonData = {};
                        jsonData.memberId = memberid;
                        jsonData.tag = memoString;
                        console.log("jsonData",jsonData)
                        middleware.request("Tag/Add", jsonData, this.hold(function (err, doc) {
                            if (err) throw err;
                            console.log("tag record:" + doc);
                        }))
                        helper.db.coll("welab/customers").update({"wechatid" : wechatid}, {$addToSet:{tags:memoString}},this.hold(function(err,doc){
                            if(err ){
                                throw err;
                            }
                        }));
                  //  }

                }else if(type==1){
                    then.req.session.scoreAll+=parseInt(score);
                    var selectChooseIdArr=seed.chooseId;
                    var selectChooseId=selectChooseIdArr.substring(0,selectChooseIdArr.length-1);
                    var selId="["+selectChooseId.replace("_",",")+"]";
                    if(memberid =="undefined"){
                        helper.db.coll("lavico/custReceive").update({"themeId":helper.db.id(_id),"type":type,
                                "themetype":themetype,"optionId":parseInt(optionId)},
                            {$set: {
                                "wechatid": wechatid,
                                "themeId": helper.db.id(_id),
                                "isFinish": false,
                                "optionId": parseInt(optionId),
                                "chooseId": selId,
                                "getChooseScore": parseInt(score),
                                "getChooseLabel":"",
                                "getLabel": "",
                                "getGift":  "",
                                "getScore": "",
                                "type":type,
                                "createTime": new Date().getTime(),
                                "memberId":"",
                                "themetype":themetype
                            }}, {upsert: true},function(err,doc){
                                if(err) throw err;
                                console.log(doc)
                            })
                    }else{
                        helper.db.coll("lavico/custReceive").update({"themeId":helper.db.id(_id),"type":type,
                                "themetype":themetype,"memberId":""+memberid,"optionId":parseInt(optionId)},
                            {$set: {
                                "wechatid": wechatid,
                                "themeId": helper.db.id(_id),
                                "isFinish": false,
                                "optionId": parseInt(optionId),
                                "chooseId": selId,
                                "getChooseScore": parseInt(score),
                                "getChooseLabel":"",
                                "getLabel": "",
                                "getGift":  "",
                                "getScore": "",
                                "type":type,
                                "createTime": new Date().getTime(),
                                "memberId":memberid,
                                "themetype":themetype
                            }}, {upsert: true},function(err,doc){
                                if(err) throw err;
                                console.log(doc)
                            })
                    }
                   // if(memberid !="undefined"){
                    if(then.req.session.customerLabel && then.req.session.customerLabel.indexOf(customerLabel)<0){
                        if(then.req.session.customerLabel){
                            then.req.session.customerLabel+=","+customerLabel;
                        }else{
                            then.req.session.customerLabel=customerLabel;
                        }
                    }
                        var memoString = docOptions.theme + customerLabel;
                        jsonData = {};
                        jsonData.memberId = memberid;
                        jsonData.tag = memoString;
                        console.log("jsonData",jsonData)
                        middleware.request("Tag/Add", jsonData, this.hold(function (err, doc) {
                            if (err) throw err;
                            console.log("tag record:" + doc);
                        }))
                        helper.db.coll("welab/customers").update({"wechatid" : wechatid}, {$addToSet:{tags:memoString}},this.hold(function(err,doc){
                            if(err ){
                                throw err;
                            }
                        }));
                  //  }

                }
                if(chooseNext!=""){
                    then.req.session.optionId = parseInt(chooseNext);
                    then.req.session.isFinish = false;
                    this.res.writeHead(302, {'Location': "/lavico/answerQuestion/answer?wechatid="+wechatid+"&_id="+_id
                        +"&optionId="+parseInt(chooseNext)+"&memberid="+memberid});
                    this.res.end();
                }else{
                    if(stopLabel!=""){
                        then.req.session.stopLabel=stopLabel;
                        then.req.session.optionId=optionId;
                        then.req.session.isFinish=true;

                        this.res.writeHead(302, {'Location': "/lavico/answerQuestion/guessfinish?wechatid="+
                                wechatid+"&_id="+_id+"&stopLab=true&optionId="+optionId+"&memberid="+memberid+"&themetype="+themetype});
                        this.res.end();
                    }else{
                        if(finish!="true"){
                            then.req.session.optionId=(parseInt(optionId)+1);
                            then.req.session.isFinish=false;

                            this.res.writeHead(302, {'Location': "/lavico/answerQuestion/answer?wechatid="+
                                wechatid+"&_id="+_id+"&optionId="+(parseInt(optionId)+1)+"&memberid="+memberid});
                            this.res.end();
                        }else{
                            this.res.writeHead(302, {'Location': "/lavico/answerQuestion/guessfinish?wechatid="+
                                wechatid+"&_id="+_id+"&optionId="+optionId+"&memberid="+memberid+"&themetype="+themetype});
                            this.res.end();
                        }
                    }
                }
            }else if(themetype==1){
                if(type==0){
                //单选
                    //积分在数字情况下记录
                    if(!isNaN(score)){
                        //session累加
                        var scores=0;
                        if(isNaN(parseInt(score))){
                            scores=0
                        }else{
                            scores=parseInt(score)
                            then.req.session.scoreAll+=parseInt(score);
                        }
                        //记录积分
                        if(memberid =="undefined"){
                            helper.db.coll("lavico/custReceive").update({"themeId":helper.db.id(_id),"type":type,
                                    "themetype":themetype,"optionId":parseInt(optionId)},
                                {$set: {
                                    "wechatid": wechatid,
                                    "themeId": helper.db.id(_id),
                                    "isFinish": false,
                                    "optionId": parseInt(optionId),
                                    "chooseId": parseInt(chooseId),
                                    "getChooseScore": scores,
                                    "getChooseLabel":"",
                                    "getLabel": "",
                                    "getGift":  "",
                                    "getScore": "",
                                    "type":type,
                                    "createTime": new Date().getTime(),
                                    "memberId":"",
                                    "themetype":themetype
                                }}, {upsert: true},function(err,doc){
                                    if(err) throw err;
                                    console.log(doc)
                                })
                        }else{
                            helper.db.coll("lavico/custReceive").update({"themeId":helper.db.id(_id),"type":type,
                                    "themetype":themetype,"memberId":""+memberid,"optionId":parseInt(optionId)},
                                {$set: {
                                    "wechatid": wechatid,
                                    "themeId": helper.db.id(_id),
                                    "isFinish": false,
                                    "optionId": parseInt(optionId),
                                    "chooseId": parseInt(chooseId),
                                    "getChooseScore": scores,
                                    "getChooseLabel":"",
                                    "getLabel": "",
                                    "getGift":  "",
                                    "getScore": "",
                                    "type":type,
                                    "createTime": new Date().getTime(),
                                    "memberId":memberid,
                                    "themetype":themetype
                                }}, {upsert: true},function(err,doc){
                                    if(err) throw err;
                                    console.log(doc)
                                })
                        }

                    }

                    if(chooseNext!=""){
                        //下一题不空，跳转指定题
                        //先记录optionId和isFinish,为了让其能history.back后继续
                        then.req.session.optionId=parseInt(chooseNext);
                        then.req.session.isFinish=false;
                        this.res.writeHead(302, {'Location': "/lavico/answerQuestion/answer?wechatid="+wechatid+"&_id="+_id
                            +"&optionId="+parseInt(chooseNext)+"&memberid="+memberid});
                        this.res.end();

                    }else{//下一题为空
                        //判断是否有停止标签
                        if(stopLabel!=""){
                            //记录停止标签
                            then.req.session.stopLabel=stopLabel;
                            //停止标签存在，同时查看是否有自定义标签(自定义标签记录到customer中) 跳转finish
                            if(customerLabel!=""){
                                //自定义标签存在,自定义标签记录到customer中(session),跳转finish
                                then.req.session.customerLabel=customerLabel;
                                //先记录optionId和isFinish,为了让其能history.back后继续
                                then.req.session.optionId=optionId;
                                then.req.session.isFinish=true;

                                this.res.writeHead(302, {'Location': "/lavico/answerQuestion/finish?wechatid="+
                                    wechatid+"&_id="+_id+"&stopLab=true&optionId="+optionId+"&memberid="+memberid+"&themetype="+themetype});
                                this.res.end();
                            }else{
                                //自定义标签不存在,跳转finish
                                //先记录optionId和isFinish,为了让其能history.back后继续
                                then.req.session.optionId=optionId;
                                then.req.session.isFinish=true;

                                this.res.writeHead(302, {'Location': "/lavico/answerQuestion/finish?wechatid="+
                                    wechatid+"&_id="+_id+"&stopLab=true&optionId="+optionId+"&memberid="+memberid+"&themetype="+themetype});
                                this.res.end();
                            }
                        }else{
                            //停止标签不存在,判断是否是完成页面过来的
                            if(finish!="true"){
                                //下一题
                                //先记录optionId和isFinish,为了让其能history.back后继续
                                then.req.session.optionId=(parseInt(optionId)+1);
                                then.req.session.isFinish=false;

                                this.res.writeHead(302, {'Location': "/lavico/answerQuestion/answer?wechatid="+
                                    wechatid+"&_id="+_id+"&optionId="+(parseInt(optionId)+1)+"&memberid="+memberid});
                                this.res.end();
                            }else{
                                //完成页面
                                this.res.writeHead(302, {'Location': "/lavico/answerQuestion/finish?wechatid="+
                                    wechatid+"&_id="+_id+"&optionId="+optionId+"&memberid="+memberid+"&themetype="+themetype});
                                this.res.end();

                            }
                        }
                    }
                }else if(type==1){
                    //复选题,记录session
                    then.req.session.scoreAll+=parseInt(score);
                    //记录复选答案在chooseId中
                    var selectChooseIdArr=seed.chooseId;
                    var selectChooseId=selectChooseIdArr.substring(0,selectChooseIdArr.length-1);
                    var selId="["+selectChooseId.replace("_",",")+"]";

                    if(memberid =="undefined"){
                        helper.db.coll("lavico/custReceive").update({"themeId":helper.db.id(_id),"type":type,
                                "themetype":themetype,"optionId":parseInt(optionId)},
                            {$set: {
                                "wechatid": wechatid,
                                "themeId": helper.db.id(_id),
                                "isFinish": false,
                                "optionId": parseInt(optionId),
                                "chooseId": selId,
                                "getChooseScore": parseInt(score),
                                "getChooseLabel":"",
                                "getLabel": "",
                                "getGift":  "",
                                "getScore": "",
                                "createTime": new Date().getTime(),
                                "type":type,
                                "memberId":"",
                                "themetype":themetype
                            }}, {upsert: true},function(err,doc){
                                if(err) throw err;
                                console.log(doc)
                            })
                    }else{
                        helper.db.coll("lavico/custReceive").update({"themeId":helper.db.id(_id),"type":type,
                                "themetype":themetype,"memberId":""+memberid,"optionId":parseInt(optionId)},
                            {$set: {
                                "wechatid": wechatid,
                                "themeId": helper.db.id(_id),
                                "isFinish": false,
                                "optionId": parseInt(optionId),
                                "chooseId": selId,
                                "getChooseScore": parseInt(score),
                                "getChooseLabel":"",
                                "getLabel": "",
                                "getGift":  "",
                                "getScore": "",
                                "createTime": new Date().getTime(),
                                "type":type,
                                "memberId":memberid,
                                "themetype":themetype
                            }}, {upsert: true},function(err,doc){
                                if(err) throw err;
                                console.log(doc)
                            })
                    }


                    //判断是否为最后一页
                    if(finish!="true"){
                        //下一题页
                        //先记录optionId和isFinish,为了让其能history.back后继续
                        then.req.session.optionId=(parseInt(optionId)+1);
                        then.req.session.isFinish=false;

                        this.res.writeHead(302, {'Location': "/lavico/answerQuestion/answer?wechatid="+
                            wechatid+"&_id="+_id+"&optionId="+(parseInt(optionId)+1)+"&memberid="+memberid});
                        this.res.end();
                    }else{
                        //完成页
                        //先记录optionId和isFinish,为了让其能history.back后继续
                        then.req.session.optionId=optionId;
                        then.req.session.isFinish=true;

//                        this.res.writeHead(302, {'Location': "/lavico/answerQuestion/finish?wechatid="+wechatid+
//                            "&_id="+_id+"&optionId="+optionId+"&memberid="+memberid+"&themetype="+themetype+"&parm="+parm});
//                        this.res.end();
                        if(then.req.session.isFinish){
                            this.res.writeHead(302, {'Location': "/lavico/answerQuestion/finish?wechatid="+wechatid+
                                "&_id="+_id+"&optionId="+then.req.session.optionId+"&memberid="+memberid+"&themetype="+themetype});
                            this.res.end();
                        }else{
                            if(finish!="true"){
                                this.res.writeHead(302, {'Location': "/lavico/answerQuestion/answer?wechatid="+
                                    wechatid+"&_id="+_id+
                                    "&optionId="+then.req.session.optionId});
                                this.res.end();
                            }else{
                                this.res.writeHead(302, {'Location': "/lavico/answerQuestion/finish?wechatid="+wechatid+
                                    "&_id="+_id+"&optionId="+then.req.session.optionId+"&memberid="+memberid+"&themetype="+themetype});
                                this.res.end();
                            }
                        }
                    }
                }
            }else if(docvar==null){
                //没有记录过
                if(type==0){//单选
                    //积分在数字情况下记录
                    if(!isNaN(score)){
                        //session累加
                        var scores=0;
                        if(isNaN(parseInt(score))){
                            scores=0
                        }else{
                            scores=parseInt(score)
                            then.req.session.scoreAll+=parseInt(score);
                        }
                        //记录积分
                        if(memberid =="undefined"){
                            helper.db.coll("lavico/custReceive").insert({
                                "wechatid": wechatid,
                                "themeId": helper.db.id(_id),
                                "isFinish": false,
                                "optionId": parseInt(optionId),
                                "chooseId": parseInt(chooseId),
                                "getChooseScore": scores,
                                "getChooseLabel":"",
                                "getLabel": "",
                                "getGift":  "",
                                "getScore": "",
                                "type":type,
                                "createTime":new Date().getTime(),
                                "memberId":"",
                                "themetype":themetype
                            },function(err,doc){
                            });
                        }else{
                            helper.db.coll("lavico/custReceive").insert({
                                "wechatid": wechatid,
                                "themeId": helper.db.id(_id),
                                "isFinish": false,
                                "optionId": parseInt(optionId),
                                "chooseId": parseInt(chooseId),
                                "getChooseScore": scores,
                                "getChooseLabel":"",
                                "getLabel": "",
                                "getGift":  "",
                                "getScore": "",
                                "type":type,
                                "createTime":new Date().getTime(),
                                "memberId":memberid,
                                "themetype":themetype
                            },function(err,doc){
                            });
                        }

                    }

                    if(chooseNext!=""){
                        //下一题不空，跳转指定题
                        //先记录optionId和isFinish,为了让其能history.back后继续
                        then.req.session.optionId=parseInt(chooseNext);
                        then.req.session.isFinish=false;
                        this.res.writeHead(302, {'Location': "/lavico/answerQuestion/answer?wechatid="+wechatid+"&_id="+_id
                            +"&optionId="+parseInt(chooseNext)});
                        this.res.end();

                    }else{//下一题为空
                        //判断是否有停止标签
                        if(stopLabel!=""){
                            //记录停止标签
                            then.req.session.stopLabel=stopLabel;
                            //停止标签存在，同时查看是否有自定义标签(自定义标签记录到customer中) 跳转finish
                            if(customerLabel!=""){
                                //自定义标签存在,自定义标签记录到customer中(session),跳转finish
                                then.req.session.customerLabel=customerLabel;
                                //先记录optionId和isFinish,为了让其能history.back后继续
                                then.req.session.optionId=optionId;
                                then.req.session.isFinish=true;

                                this.res.writeHead(302, {'Location': "/lavico/answerQuestion/finish?wechatid="+
                                    wechatid+"&_id="+_id+"&stopLab=true&optionId="+optionId+"&memberid="+memberid+"&themetype="+themetype});
                                this.res.end();
                            }else{
                                //自定义标签不存在,跳转finish
                                //先记录optionId和isFinish,为了让其能history.back后继续
                                then.req.session.optionId=optionId;
                                then.req.session.isFinish=true;

                                this.res.writeHead(302, {'Location': "/lavico/answerQuestion/finish?wechatid="+
                                    wechatid+"&_id="+_id+"&stopLab=true&optionId="+optionId});
                                this.res.end();
                            }
                        }else{
                            //停止标签不存在,判断是否是完成页面过来的
                            if(finish!="true"){
                                //下一题
                                //先记录optionId和isFinish,为了让其能history.back后继续
                                then.req.session.optionId=(parseInt(optionId)+1);
                                then.req.session.isFinish=false;

                                this.res.writeHead(302, {'Location': "/lavico/answerQuestion/answer?wechatid="+
                                    wechatid+"&_id="+_id+"&optionId="+(parseInt(optionId)+1)});
                                this.res.end();
                            }else{
                                //完成页面
                                this.res.writeHead(302, {'Location': "/lavico/answerQuestion/finish?wechatid="+
                                    wechatid+"&_id="+_id+"&optionId="+optionId+"&memberid="+memberid+"&themetype="+themetype});
                                this.res.end();

                            }
                        }
                    }
                }else if(type==1){
                    //复选题,记录session
                    then.req.session.scoreAll+=parseInt(score);
                    //记录复选答案在chooseId中
                    var selectChooseIdArr=seed.chooseId;
                    var selectChooseId=selectChooseIdArr.substring(0,selectChooseIdArr.length-1);
                    var selId="["+selectChooseId.replace("_",",")+"]";
                    if(memberid =="undefined"){
                        helper.db.coll("lavico/custReceive").insert({
                            "wechatid": wechatid,
                            "themeId": helper.db.id(_id),
                            "isFinish": false,
                            "optionId": parseInt(optionId),
                            "chooseId": selId,
                            "getChooseScore": parseInt(score),
                            "getChooseLabel":"",
                            "getLabel": "",
                            "getGift":  "",
                            "getScore": "",
                            "createTime": new Date().getTime(),
                            "type":type,
                            "memberId":"",
                            "themetype":themetype
                        },function(err,doc){});
                    }else{
                        helper.db.coll("lavico/custReceive").insert({
                            "wechatid": wechatid,
                            "themeId": helper.db.id(_id),
                            "isFinish": false,
                            "optionId": parseInt(optionId),
                            "chooseId": selId,
                            "getChooseScore": parseInt(score),
                            "getChooseLabel":"",
                            "getLabel": "",
                            "getGift":  "",
                            "getScore": "",
                            "createTime": new Date().getTime(),
                            "type":type,
                            "memberId":memberid,
                            "themetype":themetype
                        },function(err,doc){});
                    }

                    //判断是否为最后一页
                    if(finish!="true"){
                        //下一题页
                        //先记录optionId和isFinish,为了让其能history.back后继续
                        then.req.session.optionId=(parseInt(optionId)+1);
                        then.req.session.isFinish=false;

                        this.res.writeHead(302, {'Location': "/lavico/answerQuestion/answer?wechatid="+
                            wechatid+"&_id="+_id+"&optionId="+(parseInt(optionId)+1)});
                        this.res.end();
                    }else{
                        //完成页
                        //先记录optionId和isFinish,为了让其能history.back后继续
                        then.req.session.optionId=optionId;
                        then.req.session.isFinish=true;

//                        this.res.writeHead(302, {'Location': "/lavico/answerQuestion/finish?wechatid="+wechatid+
//                            "&_id="+_id+"&optionId="+optionId+"&memberid="+memberid+"&themetype="+themetype+"&parm="+parm});
//                        this.res.end();
                        if(then.req.session.isFinish){
                            this.res.writeHead(302, {'Location': "/lavico/answerQuestion/finish?wechatid="+wechatid+
                                "&_id="+_id+"&optionId="+then.req.session.optionId+"&memberid="+memberid+"&themetype="+themetype});
                            this.res.end();
                        }else{
                            if(finish!="true"){
                                this.res.writeHead(302, {'Location': "/lavico/answerQuestion/answer?wechatid="+
                                    wechatid+"&_id="+_id+
                                    "&optionId="+then.req.session.optionId+"&memberid="+memberid});
                                this.res.end();
                            }else{
                                this.res.writeHead(302, {'Location': "/lavico/answerQuestion/finish?wechatid="+wechatid+
                                    "&_id="+_id+"&optionId="+then.req.session.optionId+"&memberid="+memberid+"&themetype="+themetype});
                                this.res.end();
                            }
                        }
                    }
                }
            }else{
                //记录过
                if(then.req.session.isFinish){
                    //完成页过来的(************型男测试)
                    this.res.writeHead(302, {'Location': "/lavico/answerQuestion/finish?isRecord=yes&wechatid="+wechatid+
                        "&_id="+_id+"&optionId="+then.req.session.optionId+"&memberid="+memberid+"&themetype="+themetype});
                    this.res.end();
                }else{
                    //已经记录过了的
                    var themeQuestionoptionId;
                    var themeQuestionstopLabel
                    var themeQuestionchooseNext
                    for(var i=0;i<docOptions.length;i++){
                        if(optionId==docOptions[i].optionId){
                            themeQuestionoptionId=docOptions[i].optionId
                            for(var j=0;j<docOptions[i].choose.length;j++){
                                if(chooseId==docOptions[i].choose[j].chooseID){
                                    themeQuestionstopLabel = docOptions[i].choose[j].stopLabel;
                                    themeQuestionchooseNext = docOptions[i].choose[j].chooseNext
                                }
                            }
                        }
                    }

                    if(finish!="true"){
                        var next = (parseInt(optionId)+1)
                        if(themeQuestionstopLabel==''||typeof(themeQuestionstopLabel)=='undefined'){
                            if(themeQuestionchooseNext==''||typeof(themeQuestionstopLabel)=='undefined'){
                                if(next >docOptions.length){
                                    this.res.writeHead(302, {'Location': "/lavico/answerQuestion/finish?wechatid="+wechatid+
                                        "&_id="+_id+"&optionId="+docOptions.length+"&memberid="+memberid+"&themetype="+themetype});
                                    this.res.end();
                                }else{
                                    this.res.writeHead(302, {'Location': "/lavico/answerQuestion/answer?wechatid="+
                                        wechatid+"&_id="+_id+
                                        "&optionId="+next+"&memberid="+memberid});
                                    this.res.end();
                                }
                            }else{
                                this.res.writeHead(302, {'Location': "/lavico/answerQuestion/answer?wechatid="+
                                    wechatid+"&_id="+_id+
                                    "&optionId="+parseInt(themeQuestionchooseNext)+"&memberid="+memberid});
                                this.res.end();
                            }
                        }else{
                            this.res.writeHead(302, {'Location': "/lavico/answerQuestion/finish?wechatid="+wechatid+
                                "&_id="+_id+"&optionId="+optionId+"&memberid="+memberid});
                            this.res.end();
                        }
                    }else{
                        //单选按钮正常回退，再前进
                        this.res.writeHead(302, {'Location': "/lavico/answerQuestion/finish?isRecord=yes&wechatid="+wechatid+
                            "&_id="+_id+"&optionId="+optionId+"&memberid="+memberid+"&themetype="+themetype});
                        this.res.end();
                    }
                }
            }
        });
        function createTime(){
            var d = new Date();
            var vYear = d.getFullYear();
            var vMon = d.getMonth() + 1;
            var vDay = d.getDate();
            s=vYear+"-"+(vMon<10 ? "0" + vMon : vMon)+"-"+(vDay<10 ? "0"+ vDay : vDay);
            return s;
        }
    }
}