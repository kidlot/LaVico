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
        var stopLab=seed.stopLab ? seed.stopLabel : "null";
        nut.model.wechatid = seed.wechatid

        var isRecord=seed.isRecord ? seed.isRecord : "no";
        var go=true;
        var memberid=seed.memberid;
        var themetype = seed.themetype;
        nut.model.themeType = themetype;
        var stutas= seed.stutas ? seed.stutas :"false";
        nut.model.stutas = stutas;
        nut.model.getScores ="1";

        var docs;
        this.step(function(){
            if(stutas=="true"){
                go = false;
                helper.db.coll("lavico/custReceive").find({"themeId":helper.db.id(_id),"memberId":memberid,"wechatid":wechatid,
                    "themetype":themetype,"isFinish":true} ).toArray(this.hold(function(err,doc){
                        if(err) throw err;
                        docs = doc;
                    }))
            }
        })

        this.step(function(){
            if(stutas=="true"){
                go = false;
                var sa;
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
                            nut.model.score = "0";
                            nut.model.sta = "false";
                        }else{
                            var resultList;
                            resultList = "[{"
                                + "getLabel:'" + "您上次未能完成答题"
                                + "',getScore:" + "0"
                                + ",getTipContent:'" + "您上次未能完成答题"
                                + "',getActivities:'" + "您没有获得任何礼券" + "'}]";
                            nut.model.jsonResult = eval('(' + resultList + ')');
                            nut.model.score = "0";
                            nut.model.sta = "true";
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
                            nut.model.score = "1";
                        }else{
                            var resultList;
                            resultList = "[{"
                                + "getLabel:'" + "您上次未能完成答题"
                                + "',getScore:" + "0"
                                + ",getTipContent:'" + "您上次未能完成答题"
                                + "',getActivities:'" + "您没有获得任何礼券" + "'}]";
                            nut.model.jsonResult = eval('(' + resultList + ')');
                            nut.model.score = "0";
                        }
                    }
                }
            }
        })

        this.step(function(){
            if(isRecord=="yes"){
                nut.view.disable();
                nut.write("<script>window.onload=function(){window.popupStyle2.on('很抱歉，您已经回答过此题',function(event){location.href='/lavico/member/index?wxid="+seed.wechatid+"'})}</script>");
                go=false;
            }
        })

        this.step(function(){
            if(go) {
                console.log("input go");
                var compScore
                //非停止标签过来
                if (stopLab != "true") {
                    //插入总积分
                    helper.db.coll("lavico/custReceive").insert({
                        "wechatid": wechatid,
                        "themeId": helper.db.id(_id),
                        "isFinish": true,
                        "optionId": 0,
                        "chooseId": 0,
                        "getChooseScore": parseInt(scoreAll),
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

                    var resultList = "[";
                    this.step(function () {
                        console.log("scoreRange.length:"+scoreRange.length)
                        for (var i = 0; i < scoreRange.length; i++) {
                            var minlen = scoreRange[i].conditionMinScore;//获取低分值
                            var maxlen = scoreRange[i].conditionMaxScore;//获取高分值
                            console.log(scoreAll)
                            console.log(minlen)
                            console.log(maxlen)
                            if (scoreAll >= minlen && scoreAll <= maxlen) {//在分值范围中
                                //获取三个奖励
                                var getLabel = scoreRange[i].getLabel == "" ? "" : scoreRange[i].getLabel;
                                var getScore = scoreRange[i].getScore == "" ? 0 : scoreRange[i].getScore;
                                compScore = getScore;
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
                                        jsonData.qty = compScore;
                                        jsonData.memo = '问答测试' + '-' + nut.model.themeTitle;

                                        console.log("问答测试:"+JSON.stringify(jsonData));
                                        middleware.request('Point/Change', jsonData,
                                            this.hold(function (err, doc) {
                                                if (err) throw err;
                                            })
                                        )
                                        var tagRecord='问答测试' + '-' + nut.model.themeTitle;
                                        console.log("tag:"+tagRecord);
                                        console.log("memberId:"+memberId);
                                        middleware.request("Tag/Add", {"memberId": memberId,"tag":tagRecord}, this.hold(function (err, doc) {
                                            if (err) throw err;
                                            console.log("tag record:" + doc);
                                        }))
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
                                        var memoString = "主观题-" + docTheme.theme;
                                        if (themeType == 0) {
                                            memoString = "答题抢积分-" + docTheme.theme;
                                        } else if (themeType == 1) {
                                            memoString = "型男测试-" + docTheme.theme;
                                        }
                                        //得券接口
                                        then.step(function () {
                                            var jsonData = {
                                                openid: wechatid,
                                                otherPromId: _id,
                                                //PROMOTION_CODE: getActivities,
                                                PROMOTION_CODE:"L2013112709",
                                                memo: memoString,
                                                point: 0
                                            }
                                            console.log("hello:"+JSON.stringify(jsonData));
                                            middleware.request("Point/Change",
                                                {"memberId": nut.model.memberID, "qty": getScore, "memo": memoString},
                                                this.hold(function (err, doc) {
                                                }))
                                            middleware.request("Tag/Add", {"memberId": nut.model.memberID,"tag":memoString}, this.hold(function (err, doc) {
                                                if (err) throw err;
                                                console.log("tag record:" + doc.success);
                                            }))
                                            middleware.request("Coupon/FetchCoupon", jsonData, this.hold(function (err, doc) {
                                                if (err) throw err;
                                                var docJson = JSON.parse(doc)
                                                if (docJson.success) {
                                                    newActivity = docJson.coupon_no
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
                                        })
                                    }
                                }
                                console.log("memberid:"+memberid)
                                console.log("themetype:"+themetype)
                                then.step(function () {
                                    helper.db.coll("lavico/custReceive").insert({
                                        "wechatid": wechatid,
                                        "themeId": helper.db.id(_id),
                                        "isFinish": true,
                                        "optionId": 0,
                                        "chooseId": 0,
                                        "getChooseScore": parseInt(then.req.session.scoreAll),
                                        "getChooseLabel": "",
                                        "getLabel": getLabel,
                                        "getActivities": newActivity,
                                        "getScore": getScore,
                                        "getTipContent": getTipContent,
                                        "createTime": new Date().getTime(),
                                        "memberId":memberid,
                                        "themetype":themetype
                                    }, function (err, doc) {
                                    });
                                    console.log(getLabel)
                                    console.log(getScore)
                                    console.log(getTipContent)
                                    console.log(newActivity)
                                    //记录json准备显示
                                    resultList += "{"
                                        + "getLabel:'" + getLabel
                                        + "',getScore:" + getScore
                                        + ",getTipContent:'" + getTipContent
                                        + "',getActivities:'" + newActivity + "'}";
                                    if (getLabel != "" || getLabel != null) {
                                        //发送标签至CRM
                                        jsonData = {};
                                        jsonData.memberId = nut.model.memberID;
                                        jsonData.tag = getLabel;
                                        middleware.request("Tag/Add", jsonData, this.hold(function (err, doc) {
                                            if (err) throw err;
                                            console.log("tag record:" + doc.success);
                                        }))
                                        helper.db.coll("welab/customers").update({_id : helper.db.id(wechatid)}, {$addToSet:jsonData},this.hold(function(err,doc){
                                            if(err ){
                                                throw err;
                                            }
                                        }));
                                    }
//                                if (getLabel != "" && getLabel != null) {
//                                    //发送标签至CRM
//                                     jsonData = {};
//                                    jsonData.memberId = nut.model.memberID;
//                                    jsonData.tag = getLabel;
//                                    middleware.request("Tag/Add", jsonData, this.hold(function (err, doc) {
//                                        if (err) throw err;
//                                        console.log("tag record:" + doc.success);
//                                    }))
//
//                                }
                                })
                                //调用接口结束
                            }
                            console.log("resultList:"+resultList.length)
                            if(resultList.length==0){
                                if(i==scoreRange.length-1){
                                    resultList += "{"
                                        + "getLabel:'" + "对不起,您没有获得任何奖励"
                                        + "',getScore:" + 0
                                        + ",getTipContent:'" + "对不起,您没有获得任何奖励"
                                        + "',getActivities:'" + "您没有获得任何礼券" + "'}";
                                    nut.model.stutas = "true";
                                    nut.model.score = "0";
                                    nut.model.getScores ="0";
                                }
                            }
                        }
                    })
                    this.step(function () {
                        resultList += "]";
                        //返回显示
                        console.log("___________resultList:"+resultList);
                        then.req.session.optionId = ""
                        nut.model.result = resultList;
                        nut.model.jsonResult = eval('(' + resultList + ')');
                        console.log("resultList:" + nut.model.jsonResult);
                        nut.model.sta = "false";

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
                        "getChooseScore": parseInt(then.req.session.scoreAll),
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

                    var resultList = "[";
                    this.step(function () {
                        console.log("scoreRange.length:"+scoreRange.length)
                        for (var i = 0; i < scoreRange.length; i++) {
                            //session上的停止标签和db中的设置标签一致
                            if (then.req.session.stopLabel == scoreRange[i].conditionLabel) {
                                var getLabel = scoreRange[i].getLabel == "" ? "" : scoreRange[i].getLabel;
                                var getScore = scoreRange[i].getScore == "" ? 0 : scoreRange[i].getScore;
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
                                        //根据memberId调用接口给账户加分
                                        var jsonData = {};
                                        jsonData.memberId = memberId;
                                        jsonData.qty = getScore;
                                        jsonData.memo = '问答测试:' + '-' + nut.model.themeTitle;
                                        //console.log("jsonData:"+jsonData.memberId,jsonData.qty)
                                        middleware.request('Point/Change', jsonData,
                                            this.hold(function (err, doc) {
                                                if (err) throw err;
                                            })
                                        )
                                    })
                                    if ((typeof(getLabel) == "undefined" || getLabel == "") && (typeof(getScore) == "undefined" || getScore == "") &&
                                        (typeof(getTipContent) == "undefined" || getTipContent == "") && (typeof(newActivity) == "undefined" || newActivity == "")) {
                                        resultList += "{"
                                            + "getLabel:'" + "对不起,您没有获得任何奖励"
                                            + "',getScore:" + 0
                                            + ",getTipContent:'" + "对不起,您没有获得任何奖励"
                                            + "',getActivities:'" + "null" + "'}";
                                    } else {
                                        //记录json准备显示
                                        resultList += "{"
                                            + "getLabel:'" + getLabel
                                            + "',getScore:" + getScore
                                            + ",getTipContent:'" + getTipContent
                                            + "',getActivities:'" + newActivity + "'}";
                                    }
                                    if(resultList){
                                        break;
                                    }
                                } else {
                                    if (typeof(getActivities) != "undefined" || getActivities != "") {
                                        var newActivity//服务器返回的券
                                        //调用接口开始
                                        var memoString = "主观题-" + docTheme.theme;
                                        if (themeType == 0) {
                                            memoString = "答题抢积分-" + docTheme.theme;
                                        } else if (themeType == 1) {
                                            memoString = "型男测试-" + docTheme.theme;
                                        }
                                        //调用接口开始
                                        var jsonData = {
                                            memo: memoString,
                                            openid: wechatid,
                                            otherPromId: _id,
                                            //PROMOTION_CODE:getActivities,
                                            PROMOTION_CODE: 'L2013112709',
                                            //qty:nowPromotion.coupons[0].QTY,
                                            point: 0
                                        }

                                        middleware.request("Point/Change",
                                            {"memberId": nut.model.memberID, "qty": getScore, "memo": memoString},
                                            this.hold(function (err, doc) {
                                            }))

                                        middleware.request("Tag/Add", {"memberId": nut.model.memberID,"tag":memoString}, this.hold(function (err, doc) {
                                            if (err) throw err;
                                            console.log("tag record:" + doc.success);
                                        }))

                                        then.step(function () {
                                            middleware.request("Coupon/FetchCoupon", jsonData, this.hold(function (err, doc) {
                                                if (err) throw err;
                                                var docJson = JSON.parse(doc)
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


                                        then.step(function () {
                                            helper.db.coll("lavico/custReceive").insert({
                                                "wechatid": wechatid,
                                                "themeId": helper.db.id(_id),
                                                "isFinish": true,
                                                "optionId": 0,
                                                "chooseId": 0,
                                                "getChooseScore": parseInt(then.req.session.scoreAll),
                                                "getChooseLabel": "",
                                                "getLabel": getLabel,
                                                "getActivities": newActivity,
                                                "compScore": getScore,
                                                "getTipContent": getTipContent,
                                                "createTime": new Date().getTime(),
                                                "memberId":memberid,
                                                "themetype":themetype
                                            }, function (err, doc) {
                                            });
                                            if ((typeof(getLabel) == "undefined" || getLabel == "") && (typeof(getScore) == "undefined" || getScore == "") &&
                                                (typeof(getTipContent) == "undefined" || getTipContent == "") && (typeof(newActivity) == "undefined" || newActivity == "")) {
                                                resultList += "{"
                                                    + "getLabel:'" + "null"
                                                    + "',getScore:" + 0
                                                    + ",getTipContent:'" + "null"
                                                    + "',getActivities:'" + "null" + "'}";
                                            } else {
                                                //记录json准备显示
                                                resultList += "{"
                                                    + "getLabel:'" + getLabel
                                                    + "',getScore:" + getScore
                                                    + ",getTipContent:'" + getTipContent
                                                    + "',getActivities:'" + newActivity + "'}";
//                                            if (getLabel != "" || getLabel != null) {
//                                                //发送标签至CRM
//                                                jsonData = {};
//                                                jsonData.memberId = nut.model.memberID;
//                                                jsonData.tag = getLabel;
//                                                middleware.request("Tag/Add", jsonData, this.hold(function (err, doc) {
//                                                    if (err) throw err;
//                                                    console.log("tag record:" + doc.success);
//                                                }))
//                                            }
                                            }
                                        })
                                        //调用接口结束
                                    }
                                }
                            }

                            //判断是否有session自定义标签
                            var custLabel = then.req.session.customerLabel

                            if (typeof(custLabel) != "undefined") {
                                //存在,录入customer
                                var customerLab = "{tags:[";
                                var choArr = custLabel.split(',');
                                if (choArr.length <= 1) {
                                    choArr = custLabel.split(' ');
                                }
                                //记录至customers表
                                for (var j = 0; j < choArr.length; j++) {
                                    customerLab += "'" + choArr[j] + "'" + ",";
                                }
                                var jsonStr = customerLab.substring(0, customerLab.lastIndexOf(',')).replace(' ', ',') + "]}";
                                customerLab = eval('(' + jsonStr + ')');
                                helper.db.coll("welab/customers").update({wechatid: wechatid}, {$set: customerLab}, function (err, doc) {
                                });
                            }

                            if(resultList.length==0){
                                if(i==scoreRange.length-1){
                                    resultList += "{"
                                        + "getLabel:'" + "对不起,您没有获得任何奖励"
                                        + "',getScore:" + 0
                                        + ",getTipContent:'" + "对不起,您没有获得任何奖励"
                                        + "',getActivities:'" + "您没有获得任何礼券" + "'}";
                                    nut.model.stutas = "true";
                                    nut.model.score = "0";
                                    nut.model.getScores ="0";
                                }
                            }
                        }
                    })
                    this.step(function () {
                        resultList += "]";
                        then.req.session.optionId = ""
                        nut.model.result = resultList;
                        nut.model.jsonResult = eval('(' + resultList + ')');
                        nut.model.sta = "false";
                    })
                }
            }
        })
    }
}