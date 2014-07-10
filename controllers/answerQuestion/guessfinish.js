var middleware = require('lavico/lib/middleware.js');//引入中间件
module.exports={
    layout:"lavico/layout",
    view:"lavico/templates/answerQuestion/guessfinish.html",
    process:function(seed,nut){
        var wechatid = seed.wechatid || "null";
        var _id = seed._id || "null";
        var optionid = seed.optionId || "null";
        var memberid  = seed.memberid  || "null";
        var themetype = seed.themetype || "null";
        var stutas= seed.stutas ? seed.stutas :"false";
        var stopLab=seed.stopLab ? seed.stopLab : "null";
        var newActivity="";
        var docs=[];
        var resultList=[];//显示记录
        var ok = false;
        var go = true;
        var score=0;
        var then  = this;
        var type;
        var getLabel="您已答完此题,获奖名单择期公布";
        var getScore = "您已答完此题,获奖名单择期公布";
        var newActivity="";
        var getActivities ="";
        var getTipContent="您已答完此题,获奖名单择期公布";

        this.step(function(){
            helper.db.coll("lavico/custReceive").find({"themeId":helper.db.id(_id),"memberId":memberid,"wechatid":wechatid,
                "themetype":themetype,"isFinish":true,"type":{$ne:"0"}} ).toArray(this.hold(function(err,doc){
                    if(err) throw err;
                    if(doc){
                        docs = doc;
                    }
                    if(doc.length==0){
                        ok=true;
                    }else{
                        ok = false;
                    }
                }))
        })

        this.step(function(){
            if(stutas == "true"){
                go = false;
                var sa;
                var resultList=[];
                if(docs){
                    for(var i=0;i<docs.length;i++){
                        if(docs.type!="0"){
                            sa = docs[i];
                        }
                    }
                    if(sa){
                        resultList.push(sa);
                        nut.model.jsonResult =resultList;
                        nut.model.label =resultList[0].getLabel;
                        nut.model.type =resultList[0].type;
                        nut.model.code =resultList[0].type;
                    }else{
                        var results={};
                        results.getLabel = "您已答完此题,获奖名单择期公布";
                        results.getScore = 0;
                        results.getTipContent = "您已答完此题,获奖名单择期公布";
                        results.code = "undefined";
                        results.getActivities = "您已答完此题,获奖名单择期公布";
                        results.volumename = "您已答完此题,获奖名单择期公布";
                        resultList.push(results);
                        nut.model.jsonResult =  resultList
                    }
                }
            }
        })

        //查询每道题获得的积分
        this.step(function(){
            if(go){
                helper.db.coll("lavico/custReceive").find({"themeId":helper.db.id(_id),"memberId":""+memberid,"wechatid":wechatid,
                    "themetype":""+themetype,"isFinish":false} ).toArray(this.hold(function(err,result){
                        if(err) throw err;
                        if(result){
                            scoreArr = result;
                        }
                    }))
            }
        })

        //分数累加
        this.step(function(){
            if(go){
                for(var i=0;i<scoreArr.length;i++){
                    score+=scoreArr[i].getChooseScore;
                }
            }
        })

        //查找单题组,获取分值范围数组
        this.step(function () {
            helper.db.coll("lavico/themeQuestion").findOne({"_id": helper.db.id(_id)}, then.hold(function (err, doc) {
                if (err) throw err;
                scoreRange = doc.scoreMinMax;
                volumename = doc.volumename || {};
                docTheme = doc;
                themeType = doc.themeType;
                nut.model.themeType = themeType;
                nut.model.themeTitle = doc.theme
            }));
        });

        this.step(function(){
            if(go){
                if(ok){
                    //插入总积分
                    helper.db.coll("lavico/custReceive").insert({
                        "wechatid": wechatid,
                        "themeId": helper.db.id(_id),
                        "isFinish": true,
                        "optionId": 0,
                        "chooseId": 0,
                        "getChooseScore":parseInt(score),
                        "getChooseLabel": "",
                        "getLabel": "",
                        "getActivities": "",
                        "getScore": "",
                        "createTime": new Date().getTime(),
                        "memberId":memberid,
                        "themetype":themetype,
                        "type":"0"
                    }, function (err, doc) {});
                }
            }
        })

        this.step(function(){
            if(go){
                //非停止标签过来
                if (stopLab != "true") {
                    for (var i = 0; i < scoreRange.length; i++) {
                        var minlen = scoreRange[i].conditionMinScore;//获取低分值
                        var maxlen = scoreRange[i].conditionMaxScore;//获取高分值
                        console.log(minlen)
                        console.log(maxlen)
                        //判断是否是发放卷
                        if(scoreRange[i].getActivities=="-1"){
                            type = scoreRange[i].getActivities;
                            //在分值范围中
                            if(score >= minlen && score <= maxlen && minlen!=null && maxlen!=null){
                                getScore = scoreRange[i].getScore == "" ? 0 : scoreRange[i].getScore;
                                getLabel = scoreRange[i].getLabel == "" ? "" : scoreRange[i].getLabel;
                                getActivities = scoreRange[i].getActivities == "" ? 0 : scoreRange[i].getActivities;
                                getTipContent = scoreRange[i].tipContent == "" ? "" : scoreRange[i].tipContent;
                                then.step(function (memberID) {
                                    var jsonData = {};
                                    jsonData.memberId = memberid;
                                    jsonData.qty = getScore;
                                    jsonData.memo = nut.model.themeTitle;
                                    if(ok){
                                        middleware.request('Point/Change', jsonData,
                                            this.hold(function (err, doc) {
                                                if (err) throw err;
                                                console.log(doc);
                                            })
                                        )
                                    }
                                    var results={};
                                    results.getLabel = getLabel;
                                    results.getScore = getScore;
                                    results.getTipContent = getTipContent;
                                    results.code = getActivities;
                                    results.getActivities = "您没有获得任何礼券";
                                    results.volumename = volumename;
                                    resultList.push(results);
                                    nut.model.sta = "false";
                                    nut.model.score = "1";
                                    nut.model.getScores ="1";
                                })
                            }else{
                                var results={};
                                results.getLabel = "您已答完此题,获奖名单择期公布";
                                results.getScore = "您已答完此题,获奖名单择期公布";
                                results.getTipContent = "您已答完此题,获奖名单择期公布";
                                results.code = "";
                                results.getActivities = "您没有获得任何礼券";
                                results.volumename = volumename;
                                resultList.push(results);
                            }

                        }else{
                            type = scoreRange[i].getActivities;

                            if(score >= minlen && score <= maxlen && score!=0){
                                //获取奖励
                                getScore = scoreRange[i].getScore == "" ? 0 : scoreRange[i].getScore;
                                getLabel = scoreRange[i].getLabel == "" ? "" : scoreRange[i].getLabel;
                                getActivities = scoreRange[i].getActivities == "" ? 0 : scoreRange[i].getActivities;
                                getTipContent = scoreRange[i].tipContent == "" ? "" : scoreRange[i].tipContent;
                                if (typeof(getActivities) != "undefined" && getActivities != "") {
                                    newActivity = ""
                                    //服务器返回的券
                                    //调用接口开始
                                    var memoString = "主观题-" + getScore+"积分";
                                    if (themeType == 0) {
                                        memoString = "答题抢积分-" + getScore+"积分";
                                    } else if (themeType == 1) {
                                        memoString = "型男测试-" + getLabel;
                                    }
                                    //得券接口
                                    then.step(function () {
                                        var jsonData = {
                                            openid: wechatid,
                                            otherPromId: _id,
                                            PROMOTION_CODE: getActivities,
                                            memo: memoString,
                                            point: 0
                                        }
                                        if(ok){
                                            middleware.request("Coupon/FetchCoupon", jsonData, this.hold(function (err, doc) {
                                                if (err) throw err;
                                                var docJson = JSON.parse(doc)
                                                console.log(docJson)
                                                if (docJson.success) {
                                                    newActivity = docJson.coupon_no
                                                    console.log(docJson)
                                                    nut.model.err = docJson.success
                                                    if (docJson.coupon_no) {
                                                        nut.model.errString = "无";
                                                    }
                                                    newActivity= docJson.coupon_no
                                                } else {
                                                    nut.model.err = docJson.success;
                                                    nut.model.errString = docJson.error;
                                                }
                                            }));
                                        }else{
                                            newActivity="已领过此卷";
                                        }
                                    })
                                    then.step(function(){
                                        var results={};
                                        results.getLabel = getLabel;
                                        results.getScore = getScore;
                                        results.getTipContent = getTipContent;
                                        results.code = getActivities;
                                        results.getActivities = newActivity;
                                        results.volumename = volumename;
                                        resultList.push(results);
                                        nut.model.sta = "false";
                                        nut.model.score = "1";
                                        nut.model.getScores ="1";
                                        nut.model.type = type;
                                    })
                                }
                            }else{
                                var results={};
                                results.getLabel = "您已答完此题,获奖名单择期公布";
                                results.getScore = "您已答完此题,获奖名单择期公布";
                                results.getTipContent = "您已答完此题,获奖名单择期公布";
                                results.code = "";
                                results.getActivities = "您没有获得任何礼券";
                                results.volumename = volumename;
                                resultList.push(results);
                            }
                        }
                    }


                    then.step(function(){
                        if(resultList.length==0){
                            var results={};
                            results.getLabel = "对不起,您没有获得任何奖励";
                            results.getScore = 0;
                            results.getTipContent = "对不起,您没有获得任何奖励";
                            results.code = "undefined";
                            results.getActivities = "您没有获得任何礼券";
                            results.volumename = volumename;
                            resultList.push(results)
                            nut.model.stutas = "true";
                            nut.model.score = "0";
                            nut.model.getScores ="0";
                            nut.model.type = type;
                        }
                    })


                    then.step(function(){
                        if(ok){
                            helper.db.coll("lavico/custReceive").insert({
                                "wechatid": wechatid,
                                "themeId": helper.db.id(_id),
                                "isFinish": true,
                                "optionId": 0,
                                "chooseId": 0,
                                "getChooseScore": parseInt(score),
                                "getChooseLabel": "",
                                "getLabel": getLabel,
                                "getActivities": newActivity,
                                "getScore": getScore,
                                "getTipContent": getTipContent,
                                "createTime": new Date().getTime(),
                                "memberId":memberid,
                                "themetype":themetype,
                                "code":getActivities,
                                "volumename":volumename,
                                "type":type
                            }, function (err, doc) {});
                        }

                    })
                }
            }
        })

        this.step(function(){
            if(go){
                //停止标签过来
                if (stopLab == "true") {
                    for (var i = 0; i < scoreRange.length; i++) {
                        if (then.req.session.stopLabel == scoreRange[i].conditionLabel) {
                            var minlen = scoreRange[i].conditionMinScore;//获取低分值
                            var maxlen = scoreRange[i].conditionMaxScore;//获取高分值
                            //判断是否是发放卷
                            if(scoreRange[i].getActivities=="-1"){
                                type = scoreRange[i].getActivities;
                                //在分值范围中
                                if(score >= minlen && score <= maxlen){
                                    getScore = scoreRange[i].getScore == "" ? 0 : scoreRange[i].getScore;
                                    getLabel = scoreRange[i].getLabel == "" ? "" : scoreRange[i].getLabel;
                                    getActivities = scoreRange[i].getActivities == "" ? 0 : scoreRange[i].getActivities;
                                    getTipContent = scoreRange[i].tipContent == "" ? "" : scoreRange[i].tipContent;
                                    //获取奖励
                                    then.step(function (memberID) {
                                        var jsonData = {};
                                        jsonData.memberId = memberid;
                                        jsonData.qty = getScore;
                                        jsonData.memo = nut.model.themeTitle;

                                        if(ok){
                                            console.log("问答测试:"+JSON.stringify(jsonData));
                                            middleware.request('Point/Change', jsonData,
                                                this.hold(function (err, doc) {
                                                    if (err) throw err;
                                                })
                                            )
                                        }
                                        var results ={};
                                        results.getLabel = getLabel;
                                        results.getScore = getScore;
                                        results.getTipContent = getTipContent;
                                        results.code = getActivities;
                                        results.getActivities = "您没有获得任何礼券";
                                        results.volumename = volumename;
                                        resultList.push(results)
                                        nut.model.sta = "false";
                                        nut.model.score = "1";
                                        nut.model.getScores ="1";
                                        nut.model.type = type;
                                    })
                                }else{
                                    var results={};
                                    results.getLabel = "您已答完此题,获奖名单择期公布";
                                    results.getScore = "您已答完此题,获奖名单择期公布";
                                    results.getTipContent = "您已答完此题,获奖名单择期公布";
                                    results.code = "";
                                    results.getActivities = "您没有获得任何礼券";
                                    results.volumename = volumename;
                                    resultList.push(results);
                                }
                            }else{
                                if(score >= minlen && score <= maxlen){
                                    type = scoreRange[i].getActivities;
                                    //获取奖励
                                    getScore = scoreRange[i].getScore == "" ? 0 : scoreRange[i].getScore;
                                    getLabel = scoreRange[i].getLabel == "" ? "" : scoreRange[i].getLabel;
                                    getActivities = scoreRange[i].getActivities == "" ? 0 : scoreRange[i].getActivities;
                                    getTipContent = scoreRange[i].tipContent == "" ? "" : scoreRange[i].tipContent;
                                    if (typeof(getActivities) != "undefined" && getActivities != "") {
                                        newActivity = ""
                                        //服务器返回的券
                                        //调用接口开始
                                        var memoString = "主观题-" + getScore+"积分";
                                        if (themeType == 0) {
                                            memoString = "答题抢积分-" + getScore+"积分";
                                        } else if (themeType == 1) {
                                            memoString = "型男测试-" + getLabel;
                                        }
                                        //得券接口
                                        then.step(function () {
                                            var jsonData = {
                                                openid: wechatid,
                                                otherPromId: _id,
                                                PROMOTION_CODE: getActivities,
                                                memo: memoString,
                                                point: 0
                                            }
                                            if(ok){
                                                middleware.request("Coupon/FetchCoupon", jsonData, this.hold(function (err, doc) {
                                                    if (err) throw err;
                                                    var docJson = JSON.parse(doc)
                                                    console.log(docJson)
                                                    if (docJson.success) {
                                                        newActivity = docJson.coupon_no
                                                        console.log(docJson)
                                                        nut.model.err = docJson.success
                                                        if (docJson.coupon_no) {
                                                            nut.model.errString = "无";
                                                        }
                                                        newActivity =  docJson.coupon_no
                                                    } else {
                                                        nut.model.err = docJson.success;
                                                        nut.model.errString = docJson.error;
                                                    }
                                                }));
                                            }else{
                                                newActivity="已领过此卷";
                                            }
                                        })
                                        then.step(function(){
                                            var results={};
                                            results.getLabel = getLabel;
                                            results.getScore = getScore;
                                            results.getTipContent = getTipContent;
                                            results.code = getActivities;
                                            results.getActivities = newActivity;
                                            results.volumename = volumename;
                                            resultList.push(results);
                                            nut.model.sta = "false";
                                            nut.model.score = "1";
                                            nut.model.getScores ="1";
                                            nut.model.type = type;
                                        })

                                    }
                                }else{
                                    var results={};
                                    results.getLabel = "您已答完此题,获奖名单择期公布";
                                    results.getScore = "您已答完此题,获奖名单择期公布";
                                    results.getTipContent = "您已答完此题,获奖名单择期公布";
                                    results.code = "";
                                    results.getActivities = "您没有获得任何礼券";
                                    results.volumename = volumename;
                                    resultList.push(results);
                                }
                            }
                        }
                    }

                    then.step(function(){
                        if(resultList.length==0){
                            var results={};
                            results.getLabel = "您已答完此题,获奖名单择期公布";
                            results.getScore = 0;
                            results.getTipContent = "您已答完此题,获奖名单择期公布";
                            results.code = "";
                            results.getActivities = "您已答完此题,获奖名单择期公布";
                            results.volumename = volumename;
                            resultList.push(results)
                            nut.model.stutas = "true";
                            nut.model.score = "0";
                            nut.model.getScores ="0";
                            nut.model.type = type;
                        }
                    })
                    then.step(function(){
                        if(ok){
                            helper.db.coll("lavico/custReceive").insert({
                                "wechatid": wechatid,
                                "themeId": helper.db.id(_id),
                                "isFinish": true,
                                "optionId": 0,
                                "chooseId": 0,
                                "getChooseScore": parseInt(score),
                                "getChooseLabel": "",
                                "getLabel": getLabel,
                                "getActivities": newActivity,
                                "getScore": getScore,
                                "getTipContent": getTipContent,
                                "createTime": new Date().getTime(),
                                "memberId":memberid,
                                "themetype":themetype,
                                "code":getActivities,
                                "volumename":volumename,
                                "type":type
                            }, function (err, doc) {});
                        }

                    })
                }
            }
        })

        this.step(function () {
            if(go){
                nut.model.type = type;
                then.req.session.optionId = ""
                nut.model.result = resultList;
                nut.model.jsonResult = resultList
                nut.model.label =resultList[0].getLabel;
                console.log("resultlist",resultList)
            }
        })
    }
}