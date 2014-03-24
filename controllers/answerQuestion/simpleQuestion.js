/*
location.href="/lavico/answerQuestion/simpleQuestion?_id="
+_id+"&optionId="+jsonObject.optionId+"&receiveAnswer="+content;
*/
module.exports={
    layout:null,
    view:null,
    process:function(seed,nut){
        var then=this;
    	var _id=seed._id;
        var optionId=seed.optionId;
        var receiveAnswer=seed.receiveAnswer;
        var custId="cust101";
        var score=seed.score;

        //字数判断
        helper.db.coll("lavico/themeQuestion").findOne({"_id":helper.db.id(_id)},this.hold(function(err,doc){
        	for(var i=0;i<doc.options.length;i++){
        		//console.log("doc:"+doc.options[i].optionId);
                if(doc.options[i].optionId==optionId){
                    var minCount=doc.options[i].answerRange.minCount;
                    var maxCount=doc.options[i].answerRange.maxCount;
                    var receiveAnswerCount=receiveAnswer.length;


                    if(receiveAnswerCount>minCount && receiveAnswerCount<maxCount){
                        //OK 记录至简单题记录表
                        helper.db.coll("lavico/custAnswerResult").insert(
                        {
                            "themeId":helper.db.id(_id),
                            "custId":custId,
                            "optionId":optionId,
                            "resultValue":receiveAnswer
                        },function(err,doc){

                        });

                        //记录积分
                        if(!isNaN(parseInt(score))){
                            //number
                                if(err)throw err;
                                //update score
                                if(doc){
                                    helper.db.coll("lavico/custReceive").update({"themeId":helper.db.id(_id),
                                            "isFinish":false,"custId":custId,"optionId":parseInt(optionId)},
                                        {$set:{"getScore":parseInt(score)}},function(err,doc){});
                                }else{
                                    //session

                                    then.req.session.scoreAll+=parseInt(score);
                                    console.log("simpleQuestion:"+then.req.session.scoreAll);
                                    //不存在录入
                                    helper.db.coll("lavico/custReceive").insert({
                                        "custId": custId,
                                        "themeId": helper.db.id(_id),
                                        "isFinish": false,
                                        "optionId": parseInt(optionId),
                                        "chooseId": 0,
                                        "getChooseScore": parseInt(score),
                                        "getChooseLabel":"",
                                        "getLabel": "",
                                        "getGift":  "",
                                        "compScore": "",
                                        "createTime": createTime()
                                        },function(err,doc){
                                    });

                                }


                        }else{
                            //not number,next option
                            console.log("_id:"+_id+" optionId:"+optionId+"the score IS NOT NUMBER");
                        }


                        //判断是否为最后一题
                        if(seed.finish){
                            this.res.writeHead(302, {'Location': "/lavico/answerQuestion/finish?flag=true&_id="+_id+"&optionId="+optionId});
                            this.res.end();
                        }else{
                            //go to next option
                            this.res.writeHead(302, {'Location': "/lavico/answerQuestion/answer?optionId="+(parseInt(optionId)+1)+"&_id="+_id});
                            this.res.end();
                        }
                    }else{
                        //tip
                        nut.write("<script>alert('字数不符合要求，请重填');history.back()</script>");
                    }

                }

            }


        }));

    }
}

function createTime(){
    var d = new Date();
    var vYear = d.getFullYear();
    var vMon = d.getMonth() + 1;
    var vDay = d.getDate();
    s=vYear+"-"+(vMon<10 ? "0" + vMon : vMon)+"-"+(vDay<10 ? "0"+ vDay : vDay);
    return s;
}


