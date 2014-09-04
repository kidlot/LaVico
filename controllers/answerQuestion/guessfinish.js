var middleware = require('lavico/lib/middleware.js');//引入中间件
module.exports={
    layout:"lavico/layout",
    view:"lavico/templates/answerQuestion/guessfinish.html",
    process:function(seed,nut){
        var wechatid = seed.wechatid || "null";
        nut.model.wechatid = wechatid;
        var _id = seed._id || "null";
        var optionid = seed.optionId || "null";
        var memberid  = seed.memberid  || "undefined";
        var themetype = seed.themetype || "null";
        var stutas= seed.stutas ? seed.stutas :"false";
        nut.model.stutas = stutas;
        //nut.model.memberid  =memberid;
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
        var pram = seed.pram;

        //查memberId
        this.step(function () {
            helper.db.coll("welab/customers").findOne({wechatid: seed.wechatid},
                this.hold(function (err, result) {
                    if (err) throw err;
                    if (result && result.HaiLanMemberInfo && result.HaiLanMemberInfo.memberID) {
                        nut.model.memberid = result.HaiLanMemberInfo.memberID;
                        //memberid =  result.HaiLanMemberInfo.memberID
                    }else{
                        nut.model.memberid = "undefined";
                    }
                    if(result && result.HaiLanMemberInfo){
                        if(result.HaiLanMemberInfo.action=='bind') {
                            nut.model.isok="0";
                        }else{
                            nut.model.isok = "1";
                        }
                    }else{
                        nut.model.isok = "1";
                    }
                })
            )
        })

        //查找单题组,获取分值范围数组
        this.step(function () {
            helper.db.coll("lavico/themeQuestion").findOne({"_id": helper.db.id(_id)}, then.hold(function (err, doc) {
                if (err) throw err;
                scoreRange = doc.scoreMinMax;
                volumename = doc.volumename || "";
                docTheme = doc;
                pram = doc.pram;
                themeType = doc.themeType;
                nut.model.themeType = themeType;
                nut.model.themeTitle = doc.theme
            }));
        });

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
            if(stutas == "true"){
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
                    nut.model.showtype = docTheme.showtype;
                    if(sa){
                        resultList.push(sa);
                        nut.model.jsonResult =resultList;
                        nut.model.label =resultList[0].getLabel;
                        nut.model.code =resultList[0].type;
                    }else{
                        if(docTheme.showtype==0){
                            var results={};
                            results.getLabel = "您已答完此题,获奖名单择期公布";
                            results.getScore = "0";
                            results.getTipContent = "您已答完此题,获奖名单择期公布";
                            results.code = "undefined";
                            results.getActivities = "您已答完此题,获奖名单择期公布";
                            results.volumename = "您已答完此题,获奖名单择期公布";
                            resultList.push(results);
                        }else if(docTheme.showtype==1){
                            var results={};
                            results.getLabel = "对不起,未查到您的答题记录,请联系管理员";
                            results.getScore = "0";
                            results.getTipContent = "对不起,未查到您的答题记录,请联系管理员";
                            results.code = "undefined";
                            results.getActivities = "对不起,未查到您的答题记录,请联系管理员";
                            results.volumename = "对不起,未查到您的答题记录,请联系管理员";
                            resultList.push(results);
                        }else{
                            var results={};
                            results.getLabel = "对不起,未查到您的答题记录,请联系管理员";
                            results.getScore = "0";
                            results.getTipContent = "对不起,未查到您的答题记录,请联系管理员";
                            results.code = "undefined";
                            results.getActivities = "";
                            results.volumename = "对不起,未查到您的答题记录,请联系管理员";
                            resultList.push(results);
                        }
                        nut.model.jsonResult =  resultList
                        nut.model.label =resultList[0].getLabel;
                        nut.model.code =resultList[0].type;
                    }
                }
            }
        })

        //查询每道题获得的积分
        this.step(function(){
            if(go){
                if(memberid=="undefined"){
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

        //插入总积分
        this.step(function(){
            if(go){
                if(ok){
                    //插入总积分
                    if(memberid=="undefined"){
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
                    if(docTheme && docTheme.showtype!="" && docTheme.showtype!=0){//发放优惠劵或者发放积分

                        for (var i = 0; i < scoreRange.length; i++){

                            var minlen = scoreRange[i].conditionMinScore;//获取低分值
                            var maxlen = scoreRange[i].conditionMaxScore;//获取高分值
                            if(score >= minlen && score <= maxlen && score != 0 && minlen != null && maxlen !=null){
                                getScore = scoreRange[i].getScore == "" ? 0 : scoreRange[i].getScore;
                                getLabel = scoreRange[i].getLabel == "" ? "" : scoreRange[i].getLabel;
                                getActivities = scoreRange[i].getActivities == "" ? "-1" : scoreRange[i].getActivities;
                                getTipContent = scoreRange[i].tipContent == "" ? "" : scoreRange[i].tipContent;
                                type = scoreRange[i].getActivities;
                                if(docTheme.showtype == 1){//发放积分
                                    then.step(function () {
                                        if(memberid!="undefined"){
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
                                            results.getActivities = "";
                                            results.volumename = "";
                                            resultList.push(results);
                                        }


                                    })
                                }else if(docTheme.showtype == 2 && typeof(getActivities) != "undefined" && getActivities != "" && getActivities != "-1"){//发放优惠劵
                                    newActivity = ""
                                    //服务器返回的券
                                    //调用接口开始
                                    var memoString = "竞猜型:" + getLabel;
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
                                                console.log(docJson)
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
                                    })
                                }else{
                                    var results={};
                                    results.getLabel = "对不起,您没有获得任何奖励";
                                    results.getScore = "0";
                                    results.getTipContent = "对不起,您没有获得任何奖励";
                                    results.code = "";
                                    results.getActivities = "对不起,您没有获得任何奖励";
                                    results.volumename = "";
                                    resultList.push(results);
                                }
                            }

                        }
                    }else{
                        var results={};
                        results.getLabel = "您已答完此题,获奖名单择期公布";
                        results.getScore = "0";
                        results.getTipContent = "您已答完此题,获奖名单择期公布";
                        results.code = "";
                        results.getActivities = "您已答完此题,获奖名单择期公布";
                        results.volumename = "";
                        resultList.push(results);
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
                            nut.model.type = type;
                        }
                    })


                    then.step(function(){
                        if(ok){
                            if(memberid=="undefined"){
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

                    if(docTheme && docTheme.showtype!="" && docTheme.showtype!=0){//发放优惠劵或者发放积分

                        for (var i = 0; i < scoreRange.length; i++){
                            console.log("stopLabel",then.req.session.stopLabel)
                            console.log("conditionLabel",scoreRange[i].conditionLabel)
                            console.log("scoreRange",scoreRange)
                            if (then.req.session.stopLabel == scoreRange[i].conditionLabel) {

                                var minlen = scoreRange[i].conditionMinScore;//获取低分值
                                var maxlen = scoreRange[i].conditionMaxScore;//获取高分值
                                if(score >= minlen && score <= maxlen && score != 0 && minlen != null && maxlen !=null){
                                    getScore = scoreRange[i].getScore == "" ? 0 : scoreRange[i].getScore;
                                    getLabel = scoreRange[i].getLabel == "" ? "" : scoreRange[i].getLabel;
                                    getActivities = scoreRange[i].getActivities == "" ? "-1" : scoreRange[i].getActivities;
                                    getTipContent = scoreRange[i].tipContent == "" ? "" : scoreRange[i].tipContent;
                                    type = scoreRange[i].getActivities;
                                    if( docTheme.showtype == 1){//发放积分
                                        if(memberid!="undefined"){
                                            then.step(function () {
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
                                                results.getActivities = "";
                                                results.volumename = "";
                                                resultList.push(results);
                                            })
                                        }

                                    }else if(docTheme.showtype == 2 && typeof(getActivities) != "undefined" && getActivities != "" && getActivities != "-1"){//发放优惠劵
                                        newActivity = ""
                                        //服务器返回的券
                                        //调用接口开始
                                        var memoString = "竞猜型:" + getLabel;
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
                                                    console.log(docJson)
                                                    if (docJson.success==true) {
                                                        newActivity = docJson.coupon_no
                                                        nut.model.err = docJson.success
                                                        if (docJson.coupon_no) {
                                                            nut.model.errString = "无";
                                                        }
                                                        newActivity= docJson.coupon_no
                                                    } else {
//                                                        newActivity="数据错误";
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
                                        })
                                    }else{
                                        var results={};
                                        results.getLabel = "对不起,您没有获得任何奖励";
                                        results.getScore = "0";
                                        results.getTipContent = "对不起,您没有获得任何奖励";
                                        results.code = "";
                                        results.getActivities = "对不起,您没有获得任何奖励";
                                        results.volumename = "";
                                        resultList.push(results);
                                    }
                                }
                            }
                        }
                    }else{
                        var results={};
                        results.getLabel = "您已答完此题,获奖名单择期公布";
                        results.getScore = "0";
                        results.getTipContent = "您已答完此题,获奖名单择期公布";
                        results.code = "";
                        results.getActivities = "您已答完此题,获奖名单择期公布";
                        results.volumename = "";
                        resultList.push(results);
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
                            nut.model.type = type;
                        }
                    })


                    then.step(function(){
                        if(ok){
                            if(memberid=="undefined"){
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
                nut.model.showtype = docTheme.showtype;
                then.req.session.optionId = ""
                nut.model.result = resultList;
                nut.model.jsonResult = resultList
                nut.model.pram = pram;
                nut.model.label =resultList[0].getLabel;
                console.log("resultlist",resultList)

                if(ok &&memberid=="undefined"){
                    if (getLabel != "" || getLabel != null || getScore!=""|| typeof (getLabel)!="undefined") {
                        //发送标签至CRM
                        var memoString="";
                        if(docTheme.showtype==0){
                            memoString = nut.model.themeTitle +":"+"已完成";
                        }else if(docTheme.showtype==1){
                            memoString = nut.model.themeTitle +":"+ getScore+"积分";
                        }else{
                            memoString = nut.model.themeTitle +":"+ getLabel;
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