var middleware = require('lavico/lib/middleware.js');//引入中间件
module.exports={
    layout:"lavico/layout",
    view:"lavico/templates/answerQuestion/answer_num4.html",
    process:function(seed,nut){

        var then=this;
        var _id=seed._id;
        var opptionId=seed.optionId;
        var wechatid=seed.wechatid;
        var scoreAll=this.req.session.scoreAll;
        var stopLab=seed.stopLab;
        nut.model.wechatid = seed.wechatid

        var compScore
        //非停止标签过来
        if(stopLab!="true"){
            //插入总积分
            helper.db.coll("lavico/custReceive").insert({
                "wechatid": wechatid,
                "themeId": helper.db.id(_id),
                "isFinish": true,
                "optionId": 0,
                "chooseId": 0,
                "getChooseScore": parseInt(scoreAll),
                "getChooseLabel":"",
                "getLabel": "",
                "getGift":  "",
                "compScore": "",
                "createTime": new Date().getTime()
            },function(err,doc){
            });



            //查找单题组,获取分值范围数组
            var scoreRange
            var docTheme;
            var themeType;
            this.step(function(){
                //console.log(_id);
                helper.db.coll("lavico/themeQuestion").findOne({"_id":helper.db.id(_id)},then.hold(function(err,doc){
                    if(err) throw err;
                    //console.log(doc);
                    scoreRange=doc.scoreMinMax;
                    docTheme=doc;
                    themeType=doc.themeType;
                    nut.model.themeType=themeType;
                    //console.log("sasa:"+nut.model.themeType)
                }));
            });
            //查找全部券
            var doc_json;
            this.step(function(){
                middleware.request('Coupon/Promotions',{
                    perPage:1000,
                    pageNum:1
                },this.hold(function(err,doc){
                    //var doc = '{"total":9,"list":[{"PROMOTION_CODE":"L2013112709","PROMOTION_NAME":"无限制现金券","PROMOTION_DESC":"无限制现金券","row_number":1,"coupons":[{"QTY":123,"COUNT":1,"USED":1},{"QTY":50,"COUNT":500,"USED":0},{"QTY":1000,"COUNT":4,"USED":3},{"QTY":500,"COUNT":49,"USED":40},{"QTY":100,"COUNT":2,"USED":2},{"QTY":10000,"COUNT":50,"USED":50}]},{"PROMOTION_CODE":"MQL201401200001","PROMOTION_NAME":"长沙友谊满3000收500券","PROMOTION_DESC":"长沙友谊满3000收500券","row_number":2,"coupons":[{"QTY":91,"COUNT":1,"USED":0},{"QTY":500,"COUNT":1,"USED":1},{"QTY":100,"COUNT":2,"USED":2}]},{"PROMOTION_CODE":"CQA201401030002","PROMOTION_NAME":"满500抵用100","PROMOTION_DESC":"满500抵用100","row_number":3,"coupons":[{"QTY":100,"COUNT":30,"USED":7}]},{"PROMOTION_CODE":"CPL201401140001","PROMOTION_NAME":"奥德臣原价满10000减2500","PROMOTION_DESC":"奥德臣原价满10000减2500","row_number":4,"coupons":[{"QTY":90,"COUNT":1,"USED":1}]},{"PROMOTION_CODE":"CQL201404010004","PROMOTION_NAME":"贡平礼品券测试","PROMOTION_DESC":"贡平礼品券测试","row_number":5,"coupons":[{"QTY":398,"COUNT":1,"USED":0}]},{"PROMOTION_CODE":"MQL201402180001","PROMOTION_NAME":"ew","PROMOTION_DESC":"ewr","row_number":6,"coupons":[]},{"PROMOTION_CODE":"CQL201402250001","PROMOTION_NAME":"买衬衫送袜子","PROMOTION_DESC":"买衬衫送袜子","row_number":7,"coupons":[{"QTY":150,"COUNT":3,"USED":1}]},{"PROMOTION_CODE":"CQL201312230001","PROMOTION_NAME":"满400抵80券","PROMOTION_DESC":"满400抵80券","row_number":8,"coupons":[{"QTY":79,"COUNT":1,"USED":1},{"QTY":97,"COUNT":1,"USED":0},{"QTY":20,"COUNT":1,"USED":1},{"QTY":100,"COUNT":23,"USED":0}]},{"PROMOTION_CODE":"CQL201403260003","PROMOTION_NAME":"398元券仅限衬衫","PROMOTION_DESC":"398元券仅限衬衫","row_number":9,"coupons":[{"QTY":398,"COUNT":5,"USED":0}]}],"perPage":20,"pageNum":1}';

                    doc = doc.replace(/[\n\r\t]/,'');
                    doc_json = eval('(' + doc + ')');
                }))

            });

            var resultList="[";
            this.step(function(){

                for(var i=0;i<scoreRange.length;i++){
                    var minlen=scoreRange[i].conditionMinScore;//获取低分值
                    var maxlen=scoreRange[i].conditionMaxScore;//获取高分值
                    var dot=1;
                    if(scoreAll>=minlen && scoreAll<=maxlen){//在分值范围中
                        //获取三个奖励
                        var getLabel= scoreRange[i].getLabel==""?"":scoreRange[i].getLabel;
                        var getScore= scoreRange[i].getScore==""?0:scoreRange[i].getScore;
                        compScore= getScore;
                        //console.log("getScore:"+getScore)
                        var getActivities= scoreRange[i].getActivities==""?0:scoreRange[i].getActivities;
                        var getTipContent= scoreRange[i].tipContent==""?"":scoreRange[i].tipContent;
                        var nowPromotion;
                        for(var j=0;j<doc_json.list.length;j++){
                            if(doc_json.list[j].PROMOTION_CODE==getActivities){
                                nowPromotion=doc_json.list[j]
                            }
                        }
                        if(typeof(getActivities)!="undefined" || getActivities!="") {
                            var newActivity=""//服务器返回的券
                            //调用接口开始
                            var memoString = "主观题-" + docTheme.theme;
                            if (themeType == 0) {
                                memoString = "答题抢积分-" + docTheme.theme;
                            } else if (themeType == 1) {
                                memoString = "型男测试-" + docTheme.theme;
                            }
                            var jsonData = {
                                openid: wechatid,
                                otherPromId: _id,
                                PROMOTION_CODE: getActivities,
                                //PROMOTION_CODE:"L2013112709",
                                memo: memoString,
                                point: getScore
                            }
                            //console.log("jsonData:"+jsonData.openid,jsonData.otherPromId,jsonData.memo,jsonData.point)
                            then.step(function () {
                                middleware.request("Coupon/FetchCoupon", jsonData, this.hold(function (err, doc) {
                                    if (err) throw err;
                                    //console.log("doc:"+doc);//doc:{"success":true,"coupon_no":"AVL1220403200016"}
                                    var docJson = JSON.parse(doc)
                                    //console.log("doc:"+docJson.success);
                                    //console.log("sss:"+doc);
                                    if (docJson.success) {
                                        newActivity = docJson.coupon_no
                                        nut.model.err = docJson.success
                                        if(docJson.coupon_no) {
                                            nut.model.errString ="无";
                                        }
                                        return docJson.coupon_no
                                    } else {

                                        nut.model.err = docJson.success;
                                        nut.model.errString = docJson.error;
                                        //console.log("err:" + doc)

                                    }
                                }));
                            })
                        }

                        then.step(function(){
                            helper.db.coll("lavico/custReceive").insert({
                                "wechatid": wechatid,
                                "themeId": helper.db.id(_id),
                                "isFinish": true,
                                "optionId": 0,
                                "chooseId": 0,
                                "getChooseScore": parseInt(then.req.session.scoreAll),
                                "getChooseLabel":"",
                                "getLabel": getLabel,
                                "getGift":  newActivity,
                                "compScore": getScore,
                                "getTipContent":getTipContent,
                                "createTime": new Date().getTime()
                            },function(err,doc){});

                            //记录json准备显示
                            resultList+="{"
                                +"getLabel:'"+getLabel
                                +"',getScore:"+getScore
                                +",getTipContent:'"+getTipContent
                                +"',getActivities:'"+newActivity+"'}";

                            if(dot>=2){
                                resultList+=",";
                            }
                            dot++;
                        })
                        //调用接口结束
                    }
                }

            })
            this.step(function(){
                resultList+="]";
                //返回显示
                then.req.session.optionId=""
                nut.model.result=resultList;
                nut.model.jsonResult=eval('('+resultList+')');
                //console.log("resultList:"+nut.model.jsonResult);
            })

        }else{
            //停止标签过来
            //记录总分
            helper.db.coll("lavico/custReceive").insert({
                "wechatid": wechatid,
                "themeId": helper.db.id(_id),
                "isFinish": true,
                "optionId": 0,
                "chooseId": 0,
                "getChooseScore": parseInt(then.req.session.scoreAll),
                "getChooseLabel":"",
                "getLabel": "",
                "getGift":  "",
                "compScore": 0,
                "createTime": new Date().getTime()
            },function(err,doc){});

            //查找单题组,获取分值范围数组
            var scoreRange;
            var docTheme;
            var themeType;
            this.step(function(){
                helper.db.coll("lavico/themeQuestion").findOne({"_id":helper.db.id(_id)},then.hold(function(err,doc){
                    if(err) throw err;
                    //console.log("doc:"+JSON.stringify(doc.scoreMinMax));
                    scoreRange=doc.scoreMinMax;
                    docTheme=doc;
                    themeType=doc.themeType;
                    nut.model.themeType=themeType;
                }));
            });

            //查找全部券
            var doc_json;
            this.step(function(){
                middleware.request('Coupon/Promotions',{
                    perPage:1000,
                    pageNum:1
                },this.hold(function(err,doc){
                    //var doc = '{"total":9,"list":[{"PROMOTION_CODE":"L2013112709","PROMOTION_NAME":"无限制现金券","PROMOTION_DESC":"无限制现金券","row_number":1,"coupons":[{"QTY":123,"COUNT":1,"USED":1},{"QTY":50,"COUNT":500,"USED":0},{"QTY":1000,"COUNT":4,"USED":3},{"QTY":500,"COUNT":49,"USED":40},{"QTY":100,"COUNT":2,"USED":2},{"QTY":10000,"COUNT":50,"USED":50}]},{"PROMOTION_CODE":"MQL201401200001","PROMOTION_NAME":"长沙友谊满3000收500券","PROMOTION_DESC":"长沙友谊满3000收500券","row_number":2,"coupons":[{"QTY":91,"COUNT":1,"USED":0},{"QTY":500,"COUNT":1,"USED":1},{"QTY":100,"COUNT":2,"USED":2}]},{"PROMOTION_CODE":"CQA201401030002","PROMOTION_NAME":"满500抵用100","PROMOTION_DESC":"满500抵用100","row_number":3,"coupons":[{"QTY":100,"COUNT":30,"USED":7}]},{"PROMOTION_CODE":"CPL201401140001","PROMOTION_NAME":"奥德臣原价满10000减2500","PROMOTION_DESC":"奥德臣原价满10000减2500","row_number":4,"coupons":[{"QTY":90,"COUNT":1,"USED":1}]},{"PROMOTION_CODE":"CQL201404010004","PROMOTION_NAME":"贡平礼品券测试","PROMOTION_DESC":"贡平礼品券测试","row_number":5,"coupons":[{"QTY":398,"COUNT":1,"USED":0}]},{"PROMOTION_CODE":"MQL201402180001","PROMOTION_NAME":"ew","PROMOTION_DESC":"ewr","row_number":6,"coupons":[]},{"PROMOTION_CODE":"CQL201402250001","PROMOTION_NAME":"买衬衫送袜子","PROMOTION_DESC":"买衬衫送袜子","row_number":7,"coupons":[{"QTY":150,"COUNT":3,"USED":1}]},{"PROMOTION_CODE":"CQL201312230001","PROMOTION_NAME":"满400抵80券","PROMOTION_DESC":"满400抵80券","row_number":8,"coupons":[{"QTY":79,"COUNT":1,"USED":1},{"QTY":97,"COUNT":1,"USED":0},{"QTY":20,"COUNT":1,"USED":1},{"QTY":100,"COUNT":23,"USED":0}]},{"PROMOTION_CODE":"CQL201403260003","PROMOTION_NAME":"398元券仅限衬衫","PROMOTION_DESC":"398元券仅限衬衫","row_number":9,"coupons":[{"QTY":398,"COUNT":5,"USED":0}]}],"perPage":20,"pageNum":1}';

                    doc = doc.replace(/[\n\r\t]/,'');
                    doc_json = eval('(' + doc + ')');
                }))

            });

            var resultList="[";
            this.step(function(){
                for(var i=0;i<scoreRange.length;i++){
                    var dot=1;
                    //session上的停止标签和db中的设置标签一致
                    if(then.req.session.stopLabel==scoreRange[i].conditionLabel){
                        var getLabel= scoreRange[i].getLabel==""?"":scoreRange[i].getLabel;
                        var getScore= scoreRange[i].getScore==""?0:scoreRange[i].getScore;
                        var getActivities= scoreRange[i].getActivities==""?0:scoreRange[i].getActivities;
                        var getTipContent= scoreRange[i].tipContent==""?0:scoreRange[i].tipContent;
                        var nowPromotion;
                        for(var j=0;j<doc_json.list.length;j++){
                            if(doc_json.list[j].PROMOTION_CODE==getActivities){
                                nowPromotion=doc_json.list[j]
                            }
                        }

                        if(typeof(getActivities)!="undefined" || getActivities!="") {
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
                                PROMOTION_CODE: 'CQL201312230001',
                                //qty:nowPromotion.coupons[0].QTY,
                                point: getScore
                            }
                            //console.log(JSON.stringify(jsonData))


                            then.step(function () {
                                middleware.request("Coupon/FetchCoupon", jsonData, this.hold(function (err, doc) {
                                    if (err) throw err;
                                    //console.log("doc:" + doc);//doc:{"success":true,"coupon_no":"AVL1220403200016"}
                                    var docJson = JSON.parse(doc)
                                    if (docJson.success) {
                                        newActivity = docJson.coupon_no
                                        nut.model.err = docJson.success
                                        nut.model.errString = docJson.coupon_no;
                                        return docJson.coupon_no
                                    } else {
                                        nut.model.err = docJson.success;
                                        nut.model.errString = docJson.error;
                                        //console.log("err:" + doc)

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
                                    "getGift": newActivity,
                                    "compScore": getScore,
                                    "getTipContent": getTipContent,
                                    "createTime": new Date().getTime()
                                }, function (err, doc) {
                                });

                                //记录json准备显示
                                resultList += "{"
                                    + "getLabel:'" + getLabel
                                    + "',getScore:" + getScore
                                    + ",getTipContent:'" + getTipContent
                                    + "',getActivities:'" + newActivity + "'}";

                                /*
                                 if(dot>=2){
                                 resultList+=",";
                                 }
                                 dot++;
                                 */
                                if (i < scoreRange.length - 1) {
                                    resultList += ",";
                                }

                            })
                            //调用接口结束
                        }
                    }
                    //判断是否有session自定义标签
                    var custLabel=then.req.session.customerLabel

                    if(typeof(custLabel)!="undefined"){
                        //存在,录入customer
                        var customerLab="{tags:[";
                        var choArr=custLabel.split(',');
                        if(choArr.length<=1){
                            choArr=custLabel.split(' ');
                        }
                        //记录至customers表
                        for(var j=0;j<choArr.length;j++){
                            customerLab+="'"+choArr[j]+"'"+",";
                        }
                        var jsonStr=customerLab.substring(0,customerLab.lastIndexOf(',')).replace(' ',',')+"]}";
                        customerLab=eval('('+jsonStr+')');
                        helper.db.coll("welab/customers").update({wechatid:wechatid},{$set:customerLab},function(err,doc){});
                    }
                }

            })
            this.step(function(){
                resultList+="]";
                then.req.session.optionId=""
                //console.log(resultList);
                nut.model.result=resultList;
                nut.model.jsonResult=eval('('+resultList+')');
            })

            this.step(function(){
                //根据姓名和电话查memberId
                helper.db.coll("welab/customers").findOne({wechatid:seed.wechatid},
                    this.hold(function(err,result){
                        if(err) throw err;
                        if(result){
                            return result.HaiLanMemberInfo.memberID
                        }
                    })
                )
            })

            this.step(function(memberId){
                //根据memberId调用接口给账户加分
                var jsonData={};
                jsonData.memberId=memberId;
                jsonData.qty=compScore;
                middleware.request('Point/Change',jsonData,
                    this.hold(function(err,doc){
                        if(err) throw err;
                        nut.message("添加完成",null,"success")
                    })
                )
            })
        }
    }
}