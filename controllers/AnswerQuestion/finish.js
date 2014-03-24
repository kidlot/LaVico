module.exports={
    layout:null,
    view:"lavico/templates/AnswerQuestion/finish.html",
    process:function(seed,nut){
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