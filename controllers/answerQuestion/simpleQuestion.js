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
        var memberid = seed.memberid || "undefined";
        var themetype = seed.themetype;
        var type = seed.type;
        var customerLabel=seed.customerLabel;//自定义标签
        //判断是否是下一题或完成按钮
        var status = seed.status ? seed.status : "false";
        var themeQuestion_doc;

        var parm;
        //字数判断
        this.step(function(){
            helper.db.coll("lavico/themeQuestion").findOne({"_id":helper.db.id(_id)},this.hold(function(err,doc){
                if(err) throw err;

                if(doc){
                    themeQuestion_doc = doc;
                    parm = doc.parm;
                }
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
                        nut.write("<script>window.onload=function(){window.popupStyle2.on('字数不符合要求，请重填',function(event){history.back()})}</script>");
                    }
                }
            }
        })

        this.step(function(docOne){
            if(docOne){
                then.req.session.scoreAll+=parseInt(docOne.answerScore);
                if(memberid =="undefined"){
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
                        "memberId":"",
                        "themetype":themetype,
                        "type":type
                    },function(err,doc){});
                }else{
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

            }
        })

        this.step(function(){
            if(seed.finish!='true'){
                this.res.writeHead(302, {
                    'Location': "/lavico/answerQuestion/answer?wechatid="+wechatId+"&optionId="+(parseInt(optionId)+1)+"&_id="+_id
                });
                this.res.end();
            }else{
                if(themetype==3){
                    var memoString = themeQuestion_doc.theme +"--"+ customerLabel;
                    jsonData = {};
                    jsonData.memberId = memberid;
                    jsonData.tag = memoString;
                    middleware.request("Tag/Add", jsonData, this.hold(function (err, doc) {
                        if (err) throw err;
                        console.log("tag record:" + doc);
                    }))
                    helper.db.coll("welab/customers").update({"wechatid" : wechatid}, {$addToSet:{tags:memoString}},this.hold(function(err,doc){
                        if(err ){
                            throw err;
                        }
                    }));

                    this.res.writeHead(302, {'Location': "/lavico/answerQuestion/guessfinish?wechatid="+
                        wechatId+"&_id="+_id+"&optionId="+optionId+"&memberid="+memberid+"&themetype="+themetype});
                    this.res.end();
                }else{
                    this.res.writeHead(302, {
                        'Location': "/lavico/answerQuestion/finish?wechatid="+wechatId+"&_id="+_id+"&optionId="+optionId+"&memberid="+memberid+"&themetype="+themetype});
                    this.res.end();
                }
            }
        })
    }
}
