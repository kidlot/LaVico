
var domain = require('domain');

/*
 简单题的处理界面
 location.href="/lavico/AnswerQuestion/SimpleQuestion?_id="
        +_id+"&optionId="+jsonObject.optionId+"&receiveAnswer="+value;
*/

module.exports={
    layout:null,
    view:null,
    process:function(seed,nut){
        nut.view.disable();
        var then=this;
        var _id=seed._id;
        var optionId=seed.optionId;
        var receiveAnswer=seed.receiveAnswer;
        var wechatId=seed.wechatid;
        var memberid = seed.memberid;
        var themetype = seed.themetype;
        var type = seed.type;
        //字数判断
        this.step(function(){
            helper.db.coll("lavico/themeQuestion").findOne({"_id":helper.db.id(_id)},this.hold(function(err,doc){
                if(err) throw err;

                if(doc)
                    return doc;
            }))
        })

        this.step(function(doc){
            console.log("1")
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
                                "resultValue":receiveAnswer,
                                "memberId":memberid,
                                "themetype":themetype,
                                "type":type
                            },function(err,doc){
                                if(err) throw err;
                            })
                        })()

                        return doc.options[i];
                    }else{
                        nut.view.disable();
                        //nut.write("<script>alert('字数不符合要求，请重填');history.back()</script>");
                        nut.write("<script>window.onload=function(){window.popupStyle2.on('字数不符合要求，请重填',function(event){history.back()})}</script>");
                        //then.terminate();
                    }
                }
            }
        })

        this.step(function(docOne){
            console.log("2")
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
                    "getScore": "",
                    "createTime": new Date().getTime(),
                    "resultValue":receiveAnswer,
                    "memberId":memberid,
                    "themetype":themetype,
                    "type":type
                },function(err,doc){});
            }
        })

        this.step(function(){
            if(seed.finish!='true'){
                this.res.writeHead(302, {
                    'Location': "/lavico/answerQuestion/answer?wechatid="+wechatId+"&optionId="+(parseInt(optionId)+1)+"&_id="+_id
                });
                this.res.end();
            }else{

                this.res.writeHead(302, {
                    'Location': "/lavico/answerQuestion/finish?wechatid="+wechatId+"&_id="+_id+"&optionId="+optionId+"&memberid="+memberid+"&themetype="+themetype});
                this.res.end();
            }
        })

    }

}
