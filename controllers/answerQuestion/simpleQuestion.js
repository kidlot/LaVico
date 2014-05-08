
var domain = require('domain');

/*
 简单题的处理界面
 location.href="/lavico/AnswerQuestion/SimpleQuestion?_id="
        +_id+"&optionId="+jsonObject.optionId+"&receiveAnswer="+value;
*/

module.exports={
    layout:null,
    view:"lavico/templates/AnswerQuestion/Review.html",
    process:function(seed,nut){
        nut.view.disable();
        var then=this;
        var _id=seed._id;
        var optionId=seed.optionId;
        var receiveAnswer=seed.receiveAnswer;
        var wechatId=seed.wechatid;

        console.log(_id);
        //字数判断
        this.step(function(){
            helper.db.coll("lavico/themeQuestion").findOne({"_id":helper.db.id(_id)},this.hold(function(err,doc){
                if(err) throw err;
                if(doc)
                    return doc;
            }))
        })

        this.step(function(doc){
            for(var i=0;i<doc.options.length;i++){
                if(doc.options[i].type==2 && doc.options[i].optionId==optionId){
                    var minCount=doc.options[i].answerRange.minCount;
                    var maxCount=doc.options[i].answerRange.maxCount;
                    var receiveAnswerCount=receiveAnswer.length;
                    if(receiveAnswerCount>=minCount && receiveAnswerCount<=maxCount){
                        (function(){
                            helper.db.coll("lavico/custAnswerResult").insert({
                                "themeId":_id,
                                "wechatId":wechatId,
                                "optionId":optionId,
                                "resultValue":receiveAnswer
                            },function(err,doc){
                                if(err) throw err;
                            })
                        })()

                        return doc.options[i];
                    }else{
                        nut.view.disable();
                        nut.write("<script>alert('字数不符合要求，请重填');history.back()</script>");
                    }
                }
            }
        })

        this.step(function(docOne){
            if(docOne){
                then.req.session.scoreAll+=parseInt(docOne.answerScore);
                helper.db.coll("lavico/custReceive").insert({
                    "wechatid": wechatId,
                    "themeId": helper.db.id(_id),
                    "isFinish": false,
                    "optionId": parseInt(optionId),
                    "chooseId": '主观题',
                    "getChooseScore": parseInt(docOne.answerScore),
                    "getChooseLabel":"",
                    "getLabel": "",
                    "getGift":  "",
                    "compScore": "",
                    "createTime": new Date().getTime()
                },function(err,doc){});
            }
        })

        this.step(function(){
            if(seed.finish!='true'){
                //go to next option
                this.res.writeHead(302, {
                    'Location': "/lavico/answerQuestion/answer?wechatid="+wechatId+"&optionId="+(parseInt(optionId)+1)+"&_id="+_id
                });
                this.res.end();
            }else{
                this.res.writeHead(302, {
                    'Location': "/lavico/answerQuestion/finish?wechatid="+wechatId+"&_id="+_id+"&optionId="+optionId});
                this.res.end();
            }
        })

    }

}
