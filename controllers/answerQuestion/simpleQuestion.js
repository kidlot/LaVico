/*
 简单题的处理界面
 location.href="/lavico/AnswerQuestion/SimpleQuestion?_id="
        +_id+"&optionId="+jsonObject.optionId+"&receiveAnswer="+value;
*/
module.exports={
    layout:null,
    view:"lavico/templates/AnswerQuestion/Review.html",
    process:function(seed,nut){
        var _id=seed._id;
        var optionId=seed.optionId;
        var receiveAnswer=seed.receiveAnswer;
        //字数判断
        helper.db.coll("lavico/themeQuestion").find({"_id":_id}).toArray(function(err,doc){
            for(var i=0;i<doc.options.length;i++){
                if(doc.options[i].type==2){
                    var minCount=doc.options[i].answerRange.minCount;
                    var maxCount=doc.options[i].answerRange.maxCount;
                    var receiveAnswerCount=receiveAnswer.length;
                    if(receiveAnswerCount>minCount && receiveAnswerCount<maxCount){
                        //OK 记录至简单题记录表
                        helper.db.coll("lavico/custAnswerResult").insert({
                            "themeId":_id,
                            "custId":'cust101',
                            "optionId":optionId,
                            "resultValue":receiveAnswer
                        },function(err,doc){});
                        //go to next option
                        this.res.writeHead(302, {
                            'Location': "/lavico/AnswerQuestion/RecordAnswer?optionId="+(parseInt(optionId)+1)+"&_id="+_id;
                        });
                        this.res.end();
                    }else{
                        //tip
                        nut.write("<script>alert('字数不符合要求，请重填');location.href='history.back()'</script>");
                    }
                }
            }
        });



    }
}