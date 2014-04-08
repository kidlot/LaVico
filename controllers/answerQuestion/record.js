module.exports={
	layout:null,
    view:null,
    process:function(seed,nut){
        var then=this;
    	var type=seed.type;//题目类型
        var optionId=seed.optionId;//选题ID
        var _id=seed._id;//大题目ID
        var chooseId=seed.chooseId;//选项编号
        var score=seed.score;//所获分值
        var chooseNext=seed.chooseNext;//下一题/标签
        var wechatid=seed.wechatid;//微信ID
        var finish=seed.finish;//是否为“完成”按钮 true
        //var mutilFlag=false;//?

        var docvar=null;//是否已经有存储
        this.step(function(){
        //判断是否已经记录
        helper.db.coll("lavico/custReceive").findOne({"themeId":helper.db.id(_id),
            "wechatid":wechatid,"optionId":parseInt(optionId)},this.hold(function(err,doc){
            docvar=doc;
        }))});

        this.step(function(){
            if(docvar==null){
                if(type==0){

                    //判断是为积分还是标签
                   if(!isNaN(score)){
                       //session
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

                    if(chooseNext==""){
                        //如果标签为空，直接下一题
                        //判断是否为完成（最后一页）
                        if(finish!="true"){
                            this.res.writeHead(302, {'Location': "/lavico/answerQuestion/answer?wechatid="+wechatid+"&_id="+_id+"&optionId="+(parseInt(optionId)+1)});
                            this.res.end();
                        }
                        else{

                            this.res.writeHead(302, {'Location': "/lavico/answerQuestion/finish?wechatid="+wechatid+"&_id="+_id+"&optionId="+optionId});
                            this.res.end();
                        }
                    }else{
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

                            /*
                            //session
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

                            //记录总分
                            for(var i=0;i<choArr.length;i++){

                                helper.db.coll("lavico/custReceive").insert({
                                    "wechatid": wechatid,
                                    "themeId": helper.db.id(_id),
                                    "isFinish": true,
                                    "optionId": parseInt(optionId),
                                    "chooseId": parseInt(chooseId),
                                    "getChooseScore": parseInt(then.req.session.scoreAll),
                                    "getChooseLabel":"",
                                    "getLabel": "",
                                    "getGift":  "",
                                    "compScore": "",
                                    "createTime": createTime()
                                },function(err,doc){
                                });
                            }
                            */
                            this.res.writeHead(302, {'Location': "/lavico/answerQuestion/finish?wechatid="+wechatid+"&flag=false&_id="+_id+"&optionId="+optionId});
                            this.res.end();
                        }else{
                            //如果没有逗号，表示是下一题
                            this.res.writeHead(302, {'Location': "/lavico/answerQuestion/answer?_id="+_id+"&optionId="+parseInt(chooseNext)});
                            this.res.end();
                        }




                    }
                }else if(type==1){
                    //复选题
                    then.req.session.scoreAll+=parseInt(score);

                    var selectChooseIdArr=seed.chooseId;
                    var selectChooseId=selectChooseIdArr.substring(0,selectChooseIdArr.length-1);
                    var selId="["+selectChooseId.replace("_",",")+"]";


                    //if(mutilFlag){
                        helper.db.coll("lavico/custReceive").insert({
                            "wechatid": wechatid,
                            "themeId": helper.db.id(_id),
                            "isFinish": false,
                            "optionId": parseInt(optionId),
                            "chooseId": selId,
                            "getChooseScore": parseInt(score),
                            "getChooseLabel":"",
                            "getLabel": "",
                            "getGift":  "",
                            "compScore": "",
                            "createTime": createTime()
                        },function(err,doc){});
                    //}

                    if(finish!="true"){
                        this.res.writeHead(302, {'Location': "/lavico/answerQuestion/answer?wechatid="+wechatid+"&_id="+_id+"&optionId="+(parseInt(optionId)+1)});
                        this.res.end();
                    }
                    else{
                        this.res.writeHead(302, {'Location': "/lavico/answerQuestion/finish?wechatid="+wechatid+"&flag=true&_id="+_id+"&optionId="+optionId});
                        this.res.end();
                    }



                }

            }
            else{
                nut.write("<script>alert('您已经回答过此题');history.back();</script>");
            }

        });

        function createTime(){
            var d = new Date();
            var vYear = d.getFullYear();
            var vMon = d.getMonth() + 1;
            var vDay = d.getDate();
            s=vYear+"-"+(vMon<10 ? "0" + vMon : vMon)+"-"+(vDay<10 ? "0"+ vDay : vDay);
            return s;
        }

    }

}