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

        var isRecord=seed.isRecord ? seed.isRecord : "no";
        var go=true;
        var memberid=seed.memberid;
        var themetype = seed.themetype;
        nut.model.themeType = themetype;
        var stutas= seed.stutas ? seed.stutas :"false";
        nut.model.stutas = stutas;
        nut.model.getScores ="1";
        var getLabel;
        var getScore;
        var scoreArr;
        var score=0;
        var volumename;
        var ok = false;

        var docs;
        this.step(function(){
            //if(stutas=="true"){
                helper.db.coll("lavico/custReceive").find({"themeId":helper.db.id(_id),"memberId":memberid,"wechatid":wechatid,
                    "themetype":themetype,"isFinish":true} ).toArray(this.hold(function(err,doc){
                        if(err) throw err;
                        if(doc){
                            console.log(doc)
                            docs = doc;
                        }
                        if(doc.length==0){
                            ok=true;
                        }else{
                            ok = false;
                        }
                    }))
            //}
        })

        this.step(function(){
            if(stutas=="true"){
                go = false;
                var sa;
                var resultList=[];
                if(docs){
                    if(themetype==1){
                        for(var i=0;i<docs.length;i++){
                            if(docs[i].getLabel!=""){
                                sa = docs[i];
                            }
                        }
                        var ssa=[];
                        if(sa){
                            ssa.push(sa);
                            nut.model.jsonResult =ssa;
                            nut.model.label =ssa[0].getLabel;
                            nut.model.score = "0";
                            nut.model.sta = "false";
                            console.log(nut.model.label)
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
                        }
                    }else{
                        for(var i=0;i<docs.length;i++){
                            if(docs[i].getScore!=""){
                                sa = docs[i];
                            }
                        }
                        var ssa=[];
                        if(sa){
                            ssa.push(sa);
                            nut.model.jsonResult =ssa;
                            nut.model.label =ssa[0].getLabel;
                            console.log(nut.model.label)
                            nut.model.score = "1";
                        }else{
                            var results={};
                            results.getLabel = "对不起,您没有获得任何奖励";
                            results.getScore = 0;
                            results.getTipContent = "对不起,您没有获得任何奖励";
                            results.code = "undefined";
                            results.getActivities = "您没有获得任何礼券";
                            results.volumename = "您没有获得任何礼券";
                            resultList.push(results);
                            nut.model.jsonResult = resultList
                            nut.model.score = "0";
                            nut.model.label =resultList[0].getLabel;
                        }
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

        this.step(function(){
            console.log(ok)
            if(go) {
                    //非停止标签过来
                    if (stopLab != "true") {
                        //插入总积分
                        helper.db.coll("lavico/custReceive").insert({
                            "wechatid": wechatid,
                            "themeId": helper.db.id(_id),
                            "isFinish": true,
                            "optionId": 0,
                            "chooseId": 0,
                            //"getChooseScore": parseInt(scoreAll),
                            "getChooseScore":parseInt(score),
                            "getChooseLabel": "",
                            "getLabel": "",
                            "getActivities": "",
                            "getScore": "",
                            "createTime": new Date().getTime(),
                            "memberId":memberid,
                            "themetype":themetype
                        }, function (err, doc) {

                        });
                        //查找单题组,获取分值范围数组
                        var scoreRange
                        var docTheme;
                        var themeType;
                        this.step(function () {
                            helper.db.coll("lavico/themeQuestion").findOne({"_id": helper.db.id(_id)}, then.hold(function (err, doc) {
                                if (err) throw err;
                                scoreRange = doc.scoreMinMax;
                                if(doc.volumename){
                                    volumename = doc.volumename;
                                }else{
                                    volumename = "undefined";
                                }

                                docTheme = doc;
                                themeType = doc.themeType;
                                nut.model.themeType = themeType;
                                nut.model.themeTitle = doc.theme
                            }));
                        });
                        //查找全部券
                        var doc_json;
                        this.step(function () {
                            middleware.request('Coupon/Promotions', {
                                perPage: 1000,
                                pageNum: 1
                            }, this.hold(function (err, doc) {
                                doc = doc.replace(/[\n\r\t]/, '');
                                doc_json = eval('(' + doc + ')');
                            }))

                        });

                        var resultList = [];

                        this.step(function () {
                            for (var i = 0; i < scoreRange.length; i++) {
                                var minlen = scoreRange[i].conditionMinScore;//获取低分值
                                var maxlen = scoreRange[i].conditionMaxScore;//获取高分值
                                if (score >= minlen && score <= maxlen) {//在分值范围中
                                    //获取三个奖励
                                    getLabel = scoreRange[i].getLabel == "" ? "" : scoreRange[i].getLabel;
                                    getScore = scoreRange[i].getScore == "" ? 0 : scoreRange[i].getScore;
                                    var getActivities = scoreRange[i].getActivities == "" ? 0 : scoreRange[i].getActivities;
                                    var getTipContent = scoreRange[i].tipContent == "" ? "" : scoreRange[i].tipContent;
                                    var nowPromotion;

                                    if (themeType != 1) {
                                        then.step(function () {
                                            //根据姓名和电话查memberId
                                            helper.db.coll("welab/customers").findOne({wechatid: seed.wechatid},
                                                this.hold(function (err, result) {
                                                    if (err) throw err;
                                                    if (result) {
                                                        nut.model.memberID = result.HaiLanMemberInfo.memberID;
                                                        return result.HaiLanMemberInfo.memberID
                                                    }
                                                })
                                            )
                                        })
                                        then.step(function (memberId) {
                                            //根据memberId调用接口给账户加分
                                            var jsonData = {};
                                            jsonData.memberId = memberId;
                                            jsonData.qty = getScore;
                                            jsonData.memo = nut.model.themeTitle;

                                            console.log("问答测试:"+JSON.stringify(jsonData));
                                            if(ok){
                                                middleware.request('Point/Change', jsonData,
                                                    this.hold(function (err, doc) {
                                                        if (err) throw err;
                                                    })
                                                )
                                            }

                                        })
                                    } else {
                                        for (var j = 0; j < doc_json.list.length; j++) {
                                            if (doc_json.list[j].PROMOTION_CODE == getActivities) {
                                                nowPromotion = doc_json.list[j]
                                            }
                                        }
                                        if (typeof(getActivities) != "undefined" && getActivities != "") {
                                            var newActivity = ""//服务器返回的券
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
                                                    //PROMOTION_CODE:"L2013112709",
                                                    memo: memoString,
                                                    point: 0
                                                }
                                                console.log(jsonData)
                                                if(ok){
                                                    middleware.request("Point/Change",
                                                        {"memberId": nut.model.memberID, "qty": getScore, "memo": memoString},
                                                        this.hold(function (err, doc) {
                                                        }))

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
                                                            return docJson.coupon_no
                                                        } else {
                                                            nut.model.err = docJson.success;
                                                            nut.model.errString = docJson.error;
                                                        }
                                                    }));
                                                }else{
                                                    newActivity="已领过此卷";
                                                }

                                                console.log("2")
                                            })
                                        }
                                    }
                                    then.step(function () {
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
                                            "volumename":volumename
                                        }, function (err, doc) {
                                        });
                                        //记录json准备显示

                                            var results={};
                                            results.getLabel = getLabel;
                                            results.getScore = getScore;
                                            results.getTipContent = getTipContent;
                                            results.code = getActivities;
                                            results.getActivities = newActivity;
                                            results.volumename = volumename;
                                            resultList.push(results);

                                    })
                                    //调用接口结束
                                }
                            }
                        })

                        this.step(function(){
                            console.log("length:"+resultList.length);
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
                            }
                        })

                        this.step(function () {
                            //返回显示
                            console.log(resultList)
                            console.log("___________resultList:"+resultList);
                            then.req.session.optionId = ""
                            nut.model.result = resultList;
                            nut.model.jsonResult = resultList
                            console.log("resultList:" + nut.model.jsonResult);
                            nut.model.sta = "false";
                            console.log("sa")
                            console.log(resultList[0].getLabel)
                            nut.model.label =resultList[0].getLabel;

                            if (getLabel != "" || getLabel != null || getScore!="") {
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
                                console.log("sa")
                                console.log(jsonData)
                                middleware.request("Tag/Add", jsonData, this.hold(function (err, doc) {
                                    if (err) throw err;
                                    console.log("tag record:" + doc);
                                }))
                                var tag = "{tags:["+memoString+"]}";

                                helper.db.coll("welab/customers").update({"wechatid" : wechatid}, {$addToSet:{tags:memoString}},this.hold(function(err,doc){
                                    if(err ){
                                        throw err;
                                    }
                                }));
                            }
                        })
                    }else {
                        //停止标签过来
                        //记录总分
                        helper.db.coll("lavico/custReceive").insert({
                            "wechatid": wechatid,
                            "themeId": helper.db.id(_id),
                            "isFinish": true,
                            "optionId": 0,
                            "chooseId": 0,
                            "getChooseScore": parseInt(score),
                            "getChooseLabel": "",
                            "getLabel": "",
                            "getActivities": "",
                            "compScore": 0,
                            "createTime": new Date().getTime(),
                            "memberId":memberid,
                            "themetype":themetype
                        }, function (err, doc) {
                        });
                        //查找单题组,获取分值范围数组
                        var scoreRange;
                        var docTheme;
                        var themeType;
                        this.step(function () {
                            helper.db.coll("lavico/themeQuestion").findOne({"_id": helper.db.id(_id)}, then.hold(function (err, doc) {
                                if (err) throw err;
                                scoreRange = doc.scoreMinMax;
                                if(doc.volumename){
                                    volumename = doc.volumename;
                                }else{
                                    volumename = "undefined";
                                }
                                docTheme = doc;
                                themeType = doc.themeType;
                                nut.model.themeType = themeType;
                            }));
                        });
                        //查找全部券
                        var doc_json;
                        this.step(function () {
                            middleware.request('Coupon/Promotions', {
                                perPage: 1000,
                                pageNum: 1
                            }, this.hold(function (err, doc) {
                                doc = doc.replace(/[\n\r\t]/, '');
                                doc_json = eval('(' + doc + ')');
                            }))
                        });
                        var resultList = [];

                        this.step(function () {

                            for (var i = 0; i < scoreRange.length; i++) {

                                //session上的停止标签和db中的设置标签一致
                                if (then.req.session.stopLabel == scoreRange[i].conditionLabel) {
                                    getLabel = scoreRange[i].getLabel == "" ? "" : scoreRange[i].getLabel;
                                    getScore = scoreRange[i].getScore == "" ? 0 : scoreRange[i].getScore;
                                    var getActivities = scoreRange[i].getActivities == "" ? 0 : scoreRange[i].getActivities;
                                    var getTipContent = scoreRange[i].tipContent == "" ? 0 : scoreRange[i].tipContent;
                                    var nowPromotion;
                                    for (var j = 0; j < doc_json.list.length; j++) {
                                        if (doc_json.list[j].PROMOTION_CODE == getActivities) {
                                            nowPromotion = doc_json.list[j]
                                        }
                                    }

                                    if (themeType != 1) {
                                        then.step(function () {
                                            //根据姓名和电话查memberId
                                            helper.db.coll("welab/customers").findOne({wechatid: seed.wechatid},
                                                this.hold(function (err, result) {
                                                    if (err) throw err;
                                                    if (result) {
                                                        return result.HaiLanMemberInfo.memberID
                                                    }
                                                })
                                            )
                                        })

                                        then.step(function (memberId) {
                                            console.log("memberId:"+memberId)
                                            //根据memberId调用接口给账户加分
                                            var jsonData = {};
                                            jsonData.memberId = memberId;
                                            jsonData.qty = getScore;
                                            jsonData.memo = nut.model.themeTitle;
                                            if(ok){
                                                middleware.request('Point/Change', jsonData,
                                                    this.hold(function (err, doc) {
                                                        if (err) throw err;
                                                    })
                                                )
                                            }


                                        })

                                        if ((typeof(getLabel) == "undefined" || getLabel == "") && (typeof(getScore) == "undefined" || getScore == "") &&
                                            (typeof(getTipContent) == "undefined" || getTipContent == "") && (typeof(newActivity) == "undefined" || newActivity == "")) {
                                            console.log("getlabel1:"+getLabel)
                                            var results={};
                                            results.getLabel = "对不起,您没有获得任何奖励";
                                            results.getScore = 0;
                                            results.getTipContent = "对不起,您没有获得任何奖励";
                                            results.code = "undefined";
                                            results.getActivities = "您没有获得任何礼券";
                                            results.volumename = volumename;
                                            resultList.push(results);
                                        } else {
                                            console.log("getlabel:"+getLabel)
                                            //记录json准备显示
                                            var results={};
                                            results.getLabel = getLabel;
                                            results.getScore = getScore;
                                            results.getTipContent = getTipContent;
                                            results.code = getActivities;
                                            results.getActivities = newActivity;
                                            results.volumename = volumename;
                                            resultList.push(results);
                                        }

                                        console.log("i:"+i)
                                        if(resultList.length>0){
                                            break;
                                        }

                                    } else {
                                        if (typeof(getActivities) != "undefined" || getActivities != "") {
                                            var newActivity=""//服务器返回的券
                                            //调用接口开始
                                            var memoString = "主观题-" + getScore+"积分";
                                            if (themeType == 0) {
                                                memoString = "答题抢积分-" + getScore+"积分";
                                            } else if (themeType == 1) {
                                                memoString = "型男测试-" + getLabel;
                                            }
                                            //调用接口开始
                                            var jsonData = {
                                                memo: memoString,
                                                openid: wechatid,
                                                otherPromId: _id,
                                                PROMOTION_CODE:getActivities,
                                                //PROMOTION_CODE: 'L2013112709',
                                                //qty:nowPromotion.coupons[0].QTY,
                                                point: 0
                                            }
                                            if(ok){
                                                middleware.request("Point/Change",
                                                    {"memberId": nut.model.memberID, "qty": getScore, "memo": memoString},
                                                    this.hold(function (err, doc) {
                                                    }))

                                                then.step(function () {
                                                    middleware.request("Coupon/FetchCoupon", jsonData, this.hold(function (err, doc) {
                                                        if (err) throw err;
                                                        var docJson = JSON.parse(doc)
                                                        console.log(docJson)
                                                        if (docJson.success) {
                                                            newActivity = docJson.coupon_no
                                                            nut.model.err = docJson.success
                                                            nut.model.errString = docJson.coupon_no;
                                                            return docJson.coupon_no
                                                        } else {
                                                            nut.model.err = docJson.success;
                                                            nut.model.errString = docJson.error;
                                                        }
                                                    }));
                                                })
                                            }else{
                                                newActivity="已领过此卷";
                                            }



                                            then.step(function () {
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
                                                    "compScore": getScore,
                                                    "getTipContent": getTipContent,
                                                    "createTime": new Date().getTime(),
                                                    "memberId":memberid,
                                                    "themetype":themetype,
                                                    "code":getActivities,
                                                    "volumename":volumename
                                                }, function (err, doc) {});

                                                if ((typeof(getLabel) == "undefined" || getLabel == "") && (typeof(getScore) == "undefined" || getScore == "")
                                                    &&(typeof(getTipContent) == "undefined" || getTipContent == "") && (typeof(newActivity) == "undefined" || newActivity == "")) {
                                                    var results={};
                                                    results.getLabel = "对不起,您没有获得任何奖励";
                                                    results.getScore = 0;
                                                    results.getTipContent = "对不起,您没有获得任何奖励";
                                                    results.code = "undefined";
                                                    results.getActivities = "您没有获得任何礼券";
                                                    results.volumename = volumename;
                                                    resultList.push(results)

                                                } else {
                                                    //记录json准备显示

                                                        console.log(ok)
                                                        console.log(newActivity)
                                                        var results={};
                                                        results.getLabel = getLabel;
                                                        results.getScore = getScore;
                                                        results.getTipContent = getTipContent;
                                                        results.code = getActivities;
                                                        results.getActivities = newActivity;
                                                        results.volumename = volumename;
                                                        resultList.push(results);


                                                }
                                            })
                                            //调用接口结束
                                        }
                                    }
                                }
                            }
                        })

                        this.step(function(){
                            console.log("length:"+resultList.length);
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
                            }
                        })

                        this.step(function () {
                            then.req.session.optionId = ""
                            nut.model.result = resultList;
                            nut.model.jsonResult = resultList
                            console.log(resultList)
                            nut.model.sta = "false";
                            nut.model.label =resultList[0].getLabel;

                            if (getLabel != "" || getLabel != null || getScore!="") {
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
                        })
                    }

            }
        })
    }
}