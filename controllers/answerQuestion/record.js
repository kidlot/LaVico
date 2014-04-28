//location.href="/lavico/AnswerQuestion/record?type=1&optionId="+valueArr[0]+"&_id="+_id+"
// &chooseId="+valueArr[1]+"&score="+scoreAll+"&chooseNext="+valueArr[3];
module.exports={
    layout:null,
    process:function(seed,nut){
<<<<<<< HEAD
        var then=this;
    	var type=seed.type;//题目类型
        var optionId=seed.optionId;//选题ID
        var _id=seed._id;//大题目ID
        var chooseId=seed.chooseId;//选项编号
        var score=seed.score;//所获分值
        var chooseNext=seed.chooseNext;//下一题/标签
        var wechatid=seed.wechatid;//微信ID
        var finish=seed.finish;//是否为“完成”按钮 true
        var stopLabel=seed.stopLabel;//停止标签
        var customerLabel=seed.customerLabel;//自定义标签

        console.log("input:"+_id);

        var docvar=null;//是否已经有存储,即，是否已经做过此题
        this.step(function(){
        //判断是否已经记录
        helper.db.coll("lavico/custReceive").findOne({"themeId":helper.db.id(_id),
            "wechatid":wechatid,"optionId":parseInt(optionId)},this.hold(function(err,doc){
            docvar=doc;
        }))});

        this.step(function(){
            if(docvar==null){
                if(type==0){//单选
                   //积分在数字情况下记录
                   if(!isNaN(score)){
                       console.log("000")
                       //session累加
                       then.req.session.scoreAll+=parseInt(score);
                       //记录积分
                       helper.db.coll("lavico/custReceive").insert({
                           "wechatid": wechatid,
                           "themeId": helper.db.id(_id),
                           "isFinish": false,
                           "optionId": parseInt(optionId),
                           "chooseId": parseInt(chooseId),
                           "getChooseScore": parseInt(score),
                           "getChooseLabel":"",
                           "getLabel": "",
                           "getGift":  "",
                           "compScore": "",
                           "createTime": createTime()
                       },function(err,doc){
                       });
                   }

                    if(chooseNext!=""){
                        console.log("aaa");
                      //下一题不空，跳转指定题
                        //先记录optionId和isFinish,为了让其能history.back后继续
                        then.req.session.optionId=parseInt(chooseNext);
                        then.req.session.isFinish=false;

                        this.res.writeHead(302, {'Location': "/lavico/answerQuestion/answer?wechatid="+wechatid+"&_id="+_id
                            +"&optionId="+parseInt(chooseNext)});
                        this.res.end();

                        /*
                        var chooseNextB;
                        var customerLab="{tags:[";
                        //判断标签是否有“逗号”为
                        chooseNextB=chooseNext.indexOf(',');
                        if(chooseNextB<0){
                            chooseNextB=chooseNext.indexOf(' ');
                        }
                        if(chooseNextB!=-1){
                            //如果有逗号，不是数字，记录标签
                            //注意：split如果在没有符号的情况下，返回1
                            var choArr=chooseNext.split(',');
                            if(choArr.length<=1){
                                choArr=chooseNext.split(' ');
                            }
                            //记录至customers表
                            for(var i=0;i<choArr.length;i++){
                                customerLab+="'"+choArr[i]+"'"+",";
                            }
                            var jsonStr=customerLab.substring(0,customerLab.lastIndexOf(',')).replace(' ',',')+"]}";
                            console.log(jsonStr);
                            customerLab=eval('('+jsonStr+')');
                            helper.db.coll("welab/customers").update({wechatid:wechatid},{$set:customerLab},function(err,doc){});


                            this.res.writeHead(302, {'Location': "/lavico/answerQuestion/finish?wechatid="+wechatid+"&flag=false&_id="+_id+"&optionId="+optionId});
                            this.res.end();
                        }else{
                            //如果没有逗号，表示是下一题
                            this.res.writeHead(302, {'Location': "/lavico/answerQuestion/answer?_id="+_id+"&optionId="+parseInt(chooseNext)});
                            this.res.end();
                        }
                        */

                    }else{//下一题为空
                        console.log("bbb");
                        //判断是否有停止标签
                        if(stopLabel!=""){
                            console.log("ccc")
                            //记录停止标签
                            then.req.session.stopLabel=stopLabel;

                            //停止标签存在，同时查看是否有自定义标签(自定义标签记录到customer中) 跳转finish
                            if(customerLabel!=""){
                                console.log("ddd")
                                //自定义标签存在,自定义标签记录到customer中(session),跳转finish
                                then.req.session.customerLabel=customerLabel;

                                //先记录optionId和isFinish,为了让其能history.back后继续
                                then.req.session.optionId=optionId;
                                then.req.session.isFinish=true;

                                this.res.writeHead(302, {'Location': "/lavico/answerQuestion/finish?wechatid="+
                                    wechatid+"&_id="+_id+"&stopLab=true&optionId="+optionId});
                                this.res.end();
                            }else{
                                console.log("eee")
                                //自定义标签不存在,跳转finish

                                //先记录optionId和isFinish,为了让其能history.back后继续
                                then.req.session.optionId=optionId;
                                then.req.session.isFinish=true;

                                this.res.writeHead(302, {'Location': "/lavico/answerQuestion/finish?wechatid="+
                                    wechatid+"&_id="+_id+"&stopLab=true&optionId="+optionId});
                                this.res.end();
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
>>>>>>> 1a1ed295cca06b09e127beeeb0b8336d5b395390
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

<<<<<<< HEAD

                        console.log("wechatid:"+wechatid);
                        this.res.writeHead(302, {'Location': "/lavico/answerQuestion/answer?wechatid="+
                            wechatid+"&_id="+_id+"&optionId="+(parseInt(optionId)+1)});
                        this.res.end();
                    }else{
                        //完成页

                        //先记录optionId和isFinish,为了让其能history.back后继续
                        then.req.session.optionId=optionId;
                        then.req.session.isFinish=true;

                        this.res.writeHead(302, {'Location': "/lavico/answerQuestion/finish?wechatid="+wechatid+
                            "&_id="+_id+"&optionId="+optionId});
                        this.res.end();
                    }
                }



            }else{
                if(then.req.session.optionId){
                    if(then.req.session.isFinish){
                        this.res.writeHead(302, {'Location': "/lavico/answerQuestion/finish?wechatid="+wechatid+
                            "&_id="+_id+"&optionId="+then.req.session.optionId});
                        this.res.end();
                    }else{
                        console.log("wechatid:"+wechatid);
                        console.log("_id:"+_id);
                        console.log("then.req.session.optionId:"+then.req.session.optionId);
                        this.res.writeHead(302, {'Location': "/lavico/answerQuestion/answer?wechatid="+
                            wechatid+"&_id="+_id+
                            "&optionId="+then.req.session.optionId});
                        this.res.end();
                    }
                }else{
                    nut.write("很抱歉，您已经参加过此测试了请<a href='#'>返回</a>");
                    then.terminate();
                }

=======
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
>>>>>>> 1a1ed295cca06b09e127beeeb0b8336d5b395390
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
