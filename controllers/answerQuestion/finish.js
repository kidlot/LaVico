var middleware = require('lavico/lib/middleware.js');//引入中间件
module.exports={
    layout:null,
    view:"lavico/templates/AnswerQuestion/finish.html",
    process:function(seed,nut){
<<<<<<< HEAD
        var then=this;
    	var _id=seed._id;
    	var opptionId=seed.optionId;
    	var wechatid=seed.wechatid;
    	var scoreAll=this.req.session.scoreAll;
        var stopLab=seed.stopLab;
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
    	var scoreRange;
        this.step(function(){
    		helper.db.coll("lavico/themeQuestion").findOne({"_id":helper.db.id(_id)},then.hold(function(err,doc){
	    		if(err) throw err;
    			scoreRange=doc.scoreMinMax;
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
                    var getActivities= scoreRange[i].getActivities==""?0:scoreRange[i].getActivities;

                    var nowPromotion;
                    for(var j=0;j<doc_json.list.length;j++){
                        if(doc_json.list[j].PROMOTION_CODE==getActivities){
                            nowPromotion=doc_json.list[j]
                        }
                    }

                    var newActivity//服务器返回的券
                    //调用接口开始
                    var jsonData={
                        openid:wechatid,
                        otherPromId:_id,
                        //PROMOTION_CODE:getActivities,
                        PROMOTION_CODE:'CQL201312230001',
                        //qty:nowPromotion.coupons[0].QTY,
                        point:getScore
                    }
                    console.log(JSON.stringify(jsonData))


                    then.step(function(){
                        middleware.request("Coupon/FetchCoupon",jsonData,this.hold(function(err,doc){
                            if(err) throw err;
                            console.log("doc:"+doc);//doc:{"success":true,"coupon_no":"AVL1220403200016"}
                            var docJson=JSON.parse(doc)
                            if(docJson.success){
                                newActivity= docJson.coupon_no
                                nut.model.err=docJson.success
                                nut.model.errString=docJson.coupon_no;
                                return docJson.coupon_no
                            }else{
                                nut.model.err=docJson.success;
                                nut.model.errString=docJson.error;
                                console.log("err:"+doc)

                            }
                        }));
                    })


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
                            "createTime": new Date().getTime()
                        },function(err,doc){});

                        //记录json准备显示
                        resultList+="{"
                            +"getLabel:'"+getLabel
                            +"',getScore:"+getScore
                            +",getActivities:'"+newActivity+"'}";

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
            this.step(function(){
                helper.db.coll("lavico/themeQuestion").findOne({"_id":helper.db.id(_id)},then.hold(function(err,doc){
                    if(err) throw err;
                    scoreRange=doc.scoreMinMax;
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
                console.log("scoreRange:"+JSON.stringify(scoreRange));
                for(var i=0;i<scoreRange.length;i++){
                    var dot=1;
                    //session上的停止标签和db中的设置标签一致
                    if(then.req.session.stopLabel==scoreRange[i].conditionLabel){
                        var getLabel= scoreRange[i].getLabel==""?"":scoreRange[i].getLabel;
                        var getScore= scoreRange[i].getScore==""?0:scoreRange[i].getScore;
                        var getActivities= scoreRange[i].getActivities==""?0:scoreRange[i].getActivities;

                        var nowPromotion;
                        for(var j=0;j<doc_json.list.length;j++){
                            if(doc_json.list[j].PROMOTION_CODE==getActivities){
                                nowPromotion=doc_json.list[j]
                            }
                        }

                        var newActivity//服务器返回的券
                        //调用接口开始
                        var jsonData={
                            openid:wechatid,
                            otherPromId:_id,
                            //PROMOTION_CODE:getActivities,
                            PROMOTION_CODE:'CQL201312230001',
                            //qty:nowPromotion.coupons[0].QTY,
                            point:getScore
                        }
                        console.log(JSON.stringify(jsonData))


                        then.step(function(){
                            middleware.request("Coupon/FetchCoupon",jsonData,this.hold(function(err,doc){
                                if(err) throw err;
                                console.log("doc:"+doc);//doc:{"success":true,"coupon_no":"AVL1220403200016"}
                                var docJson=JSON.parse(doc)
                                if(docJson.success){
                                    newActivity= docJson.coupon_no
                                    nut.model.err=docJson.success
                                    nut.model.errString=docJson.coupon_no;
                                    return docJson.coupon_no
                                }else{
                                    nut.model.err=docJson.success;
                                    nut.model.errString=docJson.error;
                                    console.log("err:"+doc)

                                }
                            }));
                        })

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
                                "createTime": new Date().getTime()
                            },function(err,doc){});

                            //记录json准备显示
                            resultList+="{"
                                +"getLabel:'"+getLabel
                                +"',getScore:"+getScore
                                +",getActivities:'"+newActivity+"'}";

                            /*
                            if(dot>=2){
                                resultList+=",";
                            }
                            dot++;
                            */
                            if(i<scoreRange.length-1){
                                resultList+=",";
                            }

                        })
                        //调用接口结束

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
                nut.model.result=resultList;
            })

            /*
            var resultList="[";
            helper.db.coll("lavico/custReceive").find({"themeId":helper.db.id(_id),"wechatid":wechatid,"isFinish":true})
                    .toArray(then.hold(function(err,scoreRange){
                for(var i=0;i<scoreRange.length;i++){
                    var getLabel= scoreRange[i].getLabel=="undefined"?"":scoreRange[i].getLabel;
                    var getActivities= scoreRange[i].getActivities=="undefined"?0:scoreRange[i].getActivities;
                    var getScore= scoreRange[i].getScore==""?0:scoreRange[i].getScore;
                    if(typeof(getScore)=="undefined"){
                        getScore=0;
                    }
                    resultList+="{"
                        +"getLabel:'"+getLabel
                        +"',getScore:"+getScore
                        +",getActivities:'"+getActivities+"'}";
                    if(i<scoreRange.length-1){resultList+=",";}
                }
            resultList+="]";
            nut.model.getResult=resultList;
            }));
            */
        }
 	}
}
=======
        var type=seed.type;
        var optionId=seed.optionId;
        var _id=_id;
        var chooseId=seed.chooseId;
        var score=seed.score;
        var chooseNext=seed.chooseNext;

        if(type==1 or type==0){
            //如果分值存在,记录积分
            if(!isNaN(parseInt(score))){

                helper.db.coll("lavico/custReceive").findOne({"themeId":_id, "custId":"cust101","optionId":optionId},function(err,doc){
                    if(err)throw err;
                    //存在更新
                    if(doc){
                        helper.db.coll("lavico/custReceive").update({"themeId":_id, "custId":"cust101","optionId":optionId},
                            {$set:{"getScore":score}},function(err,doc){});
                    }else{
                        //session
                        this.req.session.scoreAll+=parseInt(scoreAll);
                        //不存在录入
                        helper.db.coll("lavico/custReceive").insert({
                            "custId": "cust101",
                            "themeId": _id,
                            "isFinish": false,
                            "optionId": optionID,
                            "chooseId": chooseID,
                            "getScore": parseInt(scoreAll),
                            "getLabel": "",
                            "getGift":  "",
                            "compScore": "",
                            "createTime": createTime()
                        },function(err,doc){
                        });
                    }
                });
        }else(type==2){
            //
            helper.db.coll("lavico/custAnswerResult").insert({
                "themeId":_id,
                "custId":'cust101',
                "optionId":optionId,
                "resultValue":receiveAnswer
            },function(err,doc){});
        }
    }

        helper.db.coll("lavico/custReceive").insert({
            "custId": "cust101",
            "themeId": _id,
            "isFinish": true,
            "optionId": optionId,
            "chooseId": chooseId,
            "getScore": this.req.session.scoreAll,
            "getLabel": "",
            "getGift":  "",
            "compScore": "",
            "createTime": createTime()
        },function(err,doc){});

    //查结果
    /*
     根据总分是否在题目指定的范围内
     根据标签获取值
     */
     var scoreAll= this.req.session.scoreAll;
     helper.db.coll("lavico/themeQuestion").find({"_id":_id}).toArray(function(err,doc){
         for(var i=0;i<doc.scoreMinMax.length;i++){
             var minScore= doc.scoreMinMax[i].conditionMinScore;
             var maxScore= doc.scoreMinMax[i].conditionMaxScore;
             if(scoreAll>minScore && scoreAll<maxScore && doc.scoreMinMax[i].getLabel==""){
                //helper.db.coll("lavico/custReceive").findOne({"custId": "cust101","themeId": _id,"isFinish":true},function(err,cur){
                    //insert
                    helper.db.coll("lavico/custReceive").insert(
                        {   "custId": "cust101",
                            "themeId": _id,
                            "isFinish": true,
                            "optionId": 0
                            "chooseId": 0
                            "getScore": this.req.session.scoreAll,
                            "getLabel": doc.scoreMinMax[i].getLabel,
                            "getGift":  doc.scoreMinMax[i].getActivities,
                            "compScore": doc.scoreMinMax[i].getScore,
                            "createTime": createTime()
                        },function(err,cdoc){});
             }else if(doc.scoreMinMax[i].getLabel!="" && scoreAll>minScore && scoreAll<maxScore){
                 helper.db.coll("lavico/custReceive").insert(
                     {   "custId": "cust101",
                         "themeId": _id,
                         "isFinish": true,
                         "optionId": 0
                         "chooseId": 0
                         "getScore": this.req.session.scoreAll,
                         "getLabel": doc.scoreMinMax[i].getLabel,
                         "getGift":  doc.scoreMinMax[i].getActivities,
                         "compScore": doc.scoreMinMax[i].getScore,
                         "createTime": createTime()
                     },function(err,cdoc){});
             }else if(doc.scoreMinMax[i].getLabel!="" && (minScore=="" || maxScore=="")){
                 helper.db.coll("lavico/custReceive").insert(
                     {   "custId": "cust101",
                         "themeId": _id,
                         "isFinish": true,
                         "optionId": 0
                         "chooseId": 0
                         "getScore": this.req.session.scoreAll,
                         "getLabel": doc.scoreMinMax[i].getLabel,
                         "getGift":  doc.scoreMinMax[i].getActivities,
                         "compScore": doc.scoreMinMax[i].getScore,
                         "createTime": createTime()
                     },function(err,cdoc){});
             }
         }

        }
     });

        //显示结果
        helper.db.coll("lavico/custReceive").find({"custId": "cust101", "themeId": _id,"isFinish": true}).toArray(function(err,doc){
                num.model.result=JSON.stringify(doc);
        });
}


function createTime(){
    var d = new Date();
    var vYear = d.getFullYear();
    var vMon = d.getMonth() + 1;
    var vDay = d.getDate();
    s=vYear+"-"+(vMon<10 ? "0" + vMon : vMon)+"-"+(vDay<10 ? "0"+ vDay : vDay);
    return s;
}
>>>>>>> 1a1ed295cca06b09e127beeeb0b8336d5b395390
