var middleware = require('lavico/lib/middleware.js');//引入中间件
module.exports={
    layout:"lavico/layout",
    view:"lavico/templates/answerQuestion/answer_num4.html",
    process:function(seed,nut){

        var then=this;
        var _id=seed._id;
        var opptionId=seed.optionId ? seed.optionId : 0;
        var wechatid=seed.wechatid;
        var scoreAll=this.req.session.scoreAll;
        var stopLab=seed.stopLab ? seed.stopLab : "null";
        nut.model.wechatid = seed.wechatid
        nut.model.id = _id;
        //nut.model.parm = seed.parm || "undefined";

        var isRecord=seed.isRecord ? seed.isRecord : "no";
        var go=true;
        var memberid=seed.memberid || "undefined";
        //nut.model.memberid = memberid;
        var themetype = seed.themetype;
        nut.model.themeType = themetype;
        var stutas= seed.stutas ? seed.stutas :"false";
        nut.model.stutas = stutas;
        nut.model.getScores ="1";
        var getLabel;
        var getScore;
        var scoreArr;
        var score=0;
        var volumename;//卷名称
        var ok = false;
        var type;//卷编号

        //查找单题组,获取分值范围数组
        var scoreRange
        var docTheme;
        var themeType;

        var memberID;//memberID

        var newActivity;
        var getActivities
        var getTipContent

        var pram = seed.pram;//新流程  判断流程类型

        //查找全部券
        var doc_json;

        var resultList=[];//显示记录
        //查找单题组,获取分值范围数组
        this.step(function () {
            helper.db.coll("lavico/themeQuestion").findOne({"_id": helper.db.id(_id)}, then.hold(function (err, doc) {
                if (err) throw err;
                scoreRange = doc.scoreMinMax;
                if(doc.volumename){
                    volumename = doc.volumename;
                }else{
                    volumename = "undefined";
                }
                docTheme = doc || {};
                if(doc){
                    themeType = doc.themeType;
                    pram = doc.pram;
                    nut.model.pram = doc.pram;
                }else{
                    themeType = "undefined";
                    pram = "undefined";
                }

                nut.model.themeType = themeType;
                nut.model.themeTitle = doc.theme
            }));
        });

        this.step(function(){
            helper.db.coll("welab/customers").findOne({"wechatid":wechatid},this.hold(function(err,doc){
                if(err) throw err;

                if(doc && doc.HaiLanMemberInfo){
                    if(doc.HaiLanMemberInfo.action=='bind') {
                        nut.model.isok="0";
                    }else{
                        nut.model.isok = "1";
                    }
                }else{
                    nut.model.isok = "1";
                }
            }))
        })

        var docs;
        this.step(function(){
            if(memberid =="undefined"){
                helper.db.coll("lavico/custReceive").find({"themeId":helper.db.id(_id),"wechatid":wechatid,
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
            }else{
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
            }

        })

        this.step(function(){
            if(stutas=="true"){
                nut.model.pram = pram;
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
                        nut.model.score = "0";
                        nut.model.sta = "false";
                    }else{
                        var results={};
                        results.getLabel = "对不起,您没有获得任何奖励";
                        results.getScore = 0;
                        results.getTipContent = "对不起,您没有获得任何奖励";
                        results.code = "undefined";
                        results.getActivities = "您没有获得任何礼券";
                        results.volumename = "您没有获得任何礼券";
                        resultList.push(results);
                        nut.model.jsonResult =  resultList
                        nut.model.score = "0";
                        nut.model.sta = "true";
                        nut.model.label =resultList[0].getLabel;
                        nut.model.type =resultList[0].type;
                        nut.model.code =resultList[0].type;
                    }
                }
            }
        })

        //查询每道题获得的积分
        this.step(function(){
            if(go){
                if(memberid =="undefined"){
                    helper.db.coll("lavico/custReceive").find({"themeId":helper.db.id(_id),"wechatid":wechatid,
                        "themetype":""+themetype,"isFinish":false} ).toArray(this.hold(function(err,result){
                            if(err) throw err;
                            if(result){
                                scoreArr = result;
                            }
                        }))
                }else{
                    helper.db.coll("lavico/custReceive").find({"themeId":helper.db.id(_id),"memberId":""+memberid,"wechatid":wechatid,
                        "themetype":""+themetype,"isFinish":false} ).toArray(this.hold(function(err,result){
                            if(err) throw err;
                            if(result){
                                scoreArr = result;
                            }
                        }))
                }

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



        //查memberId
        this.step(function () {
            helper.db.coll("welab/customers").findOne({wechatid: seed.wechatid},
                this.hold(function (err, result) {
                    if (err) throw err;
                    if (result && result.HaiLanMemberInfo && result.HaiLanMemberInfo.memberID) {
                        nut.model.memberid = result.HaiLanMemberInfo.memberID;
                        memberID =  result.HaiLanMemberInfo.memberID
                    }
                    else{
                        nut.model.memberid = "undefined";
                    }
                })
            )
        })

        //插入总积分
        this.step(function(){
            if(go){
                if(ok){
                    //插入总积分
                    if(memberid =="undefined"){
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
                            "memberId":"",
                            "themetype":themetype,
                            "type":"0"
                        }, function (err, doc) {});
                    }else{
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
            }
        })

        this.step(function(){
            if(go){
                //非停止标签过来
                if (stopLab != "true") {
                    for (var i = 0; i < scoreRange.length; i++) {
                        var minlen = scoreRange[i].conditionMinScore;//获取低分值
                        var maxlen = scoreRange[i].conditionMaxScore;//获取高分值
                        //判断是否是发放卷
//                            //在分值范围中
                        if(scoreRange[i].getActivities=="-1"){
                            type = scoreRange[i].getActivities;
                            //在分值范围中

                            if(score >= minlen && score <= maxlen){
                                getScore = scoreRange[i].getScore == "" ? 0 : scoreRange[i].getScore;
                                getLabel = scoreRange[i].getLabel == "" ? "" : scoreRange[i].getLabel;
                                getActivities = scoreRange[i].getActivities == "" ? 0 : scoreRange[i].getActivities;
                                getTipContent = scoreRange[i].tipContent == "" ? "" : scoreRange[i].tipContent;
                                //获取奖励
                                if(pram == "1"){
                                    then.step(function (memberid) {
                                        //根据memberId调用接口给账户加分
                                        var jsonData = {};
                                        jsonData.memberId = memberid;
                                        jsonData.qty = getScore;
                                        jsonData.memo = nut.model.themeTitle;
                                        if(ok){
                                            middleware.request('Point/Change', jsonData,
                                                this.hold(function (err, doc) {
                                                    if (err) throw err;
                                                    console.log("doc",doc);
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
                                }

                            }

                        }else{
                            type = scoreRange[i].getActivities;

                            if(score >= minlen && score <= maxlen){
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
                                    var parm_can;
                                    if(pram == "1"){
                                        parm_can = "01";
                                    }else{
                                        parm_can = "02";
                                    }
                                    then.step(function () {
                                        var jsonData = {
                                            openid: wechatid,
                                            otherPromId: _id,
                                            PROMOTION_CODE: getActivities,
                                            memo: memoString,
                                            parm:parm_can,
                                            point: 0
                                        }
                                        if(ok){
                                            middleware.request("Coupon/FetchCoupon", jsonData, this.hold(function (err, doc) {
                                                if (err) throw err;
                                                var docJson = JSON.parse(doc)
                                                console.log("doc",doc)
                                                if (docJson.success) {
                                                    newActivity = docJson.coupon_no
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
                            if(memberid =="undefined"){
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
                                    "memberId":"",
                                    "themetype":themetype,
                                    "code":getActivities,
                                    "volumename":volumename,
                                    "type":type
                                }, function (err, doc) {});
                            }else{
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
                                    if(pram =="1"){
                                        then.step(function (memberid) {
                                            //根据memberId调用接口给账户加分
                                            var jsonData = {};
                                            jsonData.memberId = memberid;
                                            jsonData.qty = getScore;
                                            jsonData.memo = nut.model.themeTitle;

                                            if(ok){
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
                                    }

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
                                        var parm_can;
                                        if(pram == "1"){
                                            parm_can = "01";
                                        }else{
                                            parm_can = "02";
                                        }
                                        then.step(function () {
                                            var jsonData = {
                                                openid: wechatid,
                                                otherPromId: _id,
                                                PROMOTION_CODE: getActivities,
                                                memo: memoString,
                                                parm:parm_can,
                                                point: 0
                                            }
                                            if(ok){
                                                middleware.request("Coupon/FetchCoupon", jsonData, this.hold(function (err, doc) {
                                                    if (err) throw err;
                                                    var docJson = JSON.parse(doc)
                                                    console.log("docJson",docJson)
                                                    if (docJson.success) {
                                                        newActivity = docJson.coupon_no
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
                                }
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
                            if(memberid =="undefined"){
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
                                    "memberId":"",
                                    "themetype":themetype,
                                    "code":getActivities,
                                    "volumename":volumename,
                                    "type":type
                                }, function (err, doc) {});
                            }else{
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

                        }

                    })
                }
            }

        })

        this.step(function () {
            if(go){
                nut.model.code = type;
                nut.model.type = type;
                then.req.session.optionId = ""
                nut.model.result = resultList;
                nut.model.jsonResult = resultList
                nut.model.label =resultList[0].getLabel;
                nut.model.pram = pram;
                if(ok){
                    if (getLabel != "" || getLabel != null || getScore!="" || typeof (getLabel)!="undefined") {
                        //发送标签至CRM
                        var memoString = "主观题-" + getScore+"积分";
                        if (themeType == 0) {
                            memoString = "答题抢积分-" + getScore+"积分";
                        } else if (themeType == 1) {
                            memoString = "型男测试-" + getLabel;
                        }
                        jsonData = {};
                        jsonData.memberId = memberid;
                        jsonData.tag = memoString;
                        middleware.request("Tag/Add", jsonData, this.hold(function (err, doc) {
                            if (err) throw err;
                            console.log("tag record:" + doc);
                        }))
                        helper.db.coll("welab/customers").update({"wechatid" : wechatid}, {$addToSet:{tags:memoString}},this.hold(function(err,doc){
                            if(err ){
                                throw err;
                            }
                        }));
                    }
                }
            }
        })
    }
}