//location.href="/lavico/AnswerQuestion/record?type=1&optionId="+valueArr[0]+"&_id="+_id+"
// &chooseId="+valueArr[1]+"&score="+scoreAll+"&chooseNext="+valueArr[3];
module.exports={
    layout:null,
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
            }
            /*
             *判断chooseNext是否为标签还是数字
             *数字：跳转指定题号
             *标签：跳转finish
             */
            if(isNaN(parseInt(chooseNext))){
                //no number,to finish
                /*
                //记录标签和总分入表
                helper.db.coll("lavico/custReceive").insert({
                    "custId": "cust101",
                    "themeId": _id,
                    "isFinish": true,
                    "optionId": optionID,
                    "chooseId": chooseID,
                    "getScore": this.req.session.scoreAll,
                    "getLabel": "",
                    "getGift":  "",
                    "compScore": "",
                    "createTime": createTime()
                },function(err,doc){
                });

                //to finish
                this.res.writeHead(302, {
                    'Location': "/lavico/AnswerQuestion/finish?&_id="+_id;
                });
                this.res.end();
                 */
                this.res.writeHead(302, {
                    'Location': "/lavico/AnswerQuestion/finish?type=1&optionId="+optionId+"&_id="+_id+"&chooseId="+chooseId+"&score="+score+"&chooseNext="+chooseNext;
                });
                this.res.end();
            }else{
                //number,next option
                this.res.writeHead(302, {
                    'Location': "/lavico/AnswerQuestion/RecordAnswer?optionId="+chooseNext+"&_id="+_id;
                });
                this.res.end();
            }

        }else(type==2){

            /*
            helper.db.coll("lavico/custAnswerResult").insert({
                "themeId":_id,
                    "custId":'cust101',
                    "optionId":optionId,
                    "resultValue":receiveAnswer
            },function(err,doc){});
            this.res.writeHead(302, {
                'Location': "/lavico/AnswerQuestion/Review?optionId="+(parseInt(optionId)+1)+"&_id="+_id;
            });
            this.res.end();
            */
        }


    }
}
