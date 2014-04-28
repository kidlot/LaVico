<<<<<<< HEAD
var domain = require('domain');
=======
/*
 简单题的处理界面
 location.href="/lavico/AnswerQuestion/SimpleQuestion?_id="
        +_id+"&optionId="+jsonObject.optionId+"&receiveAnswer="+value;
*/
>>>>>>> 1a1ed295cca06b09e127beeeb0b8336d5b395390
module.exports={
    layout:null,
    view:"lavico/templates/AnswerQuestion/Review.html",
    process:function(seed,nut){
<<<<<<< HEAD
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
=======
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

>>>>>>> 1a1ed295cca06b09e127beeeb0b8336d5b395390

var d = domain.create();
d.on('error',function(err){
    console.log(err);
});

<<<<<<< HEAD
setInterval(function () {
    d.run(sync_error);
    d.run(async_error);
}, 1000)
=======
    }
}
>>>>>>> 1a1ed295cca06b09e127beeeb0b8336d5b395390
