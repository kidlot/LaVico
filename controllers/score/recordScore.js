module.exports={
    layout:null,
    process:function(seed,nut){
        var _id=seed._id;
        var optionID=seed.optionID;
        var chooseNext=seed.chooseNext;
        var scoreAll=seed.scoreAll;
        var chooseID=seed.chooseID;
        var resultValue=seed.resultValue;
        var type=seed.type;
        var isFinish=seed.isFinish;
        //第一次题组进入
        if(!scoreAll){
            //记录用户参与，记入客户换够表
            helper.db.coll("lavico/custReceive").insert({
                "custId":"cust101",
                "themeId":_id,
                "isFinish":false,//是否完成(没完成，表示参与人数。完成表示完成人数)
                "getScore":0,//用户做题得到的积分
                "getLabel":"",
                "optionId":0,
                "chooseId":0,
                "getGift":"",
                "compScore":"",//用户从商户那里得到的积分
                "createTime":createTime(),
                "receiveTime":""
            },function(err,doc){
                if(err)throw err;
            });

            nut.disabled=true;
            this.res.writeHead(302, {
                'Location': "/lavico/score/showTheme?_id="+_id+"&optionID="+optionID+"&chooseNext="+chooseNext
            });
            this.res.end();
        }else{

                //this.req.session.allScore+=scoreAll;

                //记录积分
                helper.db.coll("lavico/custReceive").findOne({"themeId":_id, "custId":"cust101"},function(err,doc){
                    if(err)throw err;
                    /*
                    helper.db.coll("lavico/custReceive").update(
                        {"themeId":_id, "custId":"cust101"},
                        {$set:{"getScore":doc.getScore+parseInt(scoreAll)}},
                        //{$set:{"getScore":doc.getScore+parseInt(scoreAll)}},
                        function(err,dic){});
                    */

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
                        "createTime": createTime(),
                        "receiveTime": ""
                    },function(err,doc){
                    });

                });

            if(resultValue){
                //记录答案
                helper.db.coll("lavico/custAnswerResult").insert({
                        "themeId":_id,
                        "custId":'cust101',
                        "optionId":optionID,
                        "resultValue":resultValue
                    },function(err,doc){});
            }

            //完成
            if(isFinish){
                //修改完成效果
                helper.db.coll("lavico/custReceive").update(
                    {"themeId":_id, "custId":"cust101"},
                    {$set:{"isFinish":true}},
                    function(err,dic){});



                //跳转完成页面
                this.res.writeHead(302, {
                    'Location': "/lavico/score/finish?scoreAll="+scoreAll+"&type="+type+"&_id="+_id+"&optionID="+optionID+"&resultValue='"+resultValue+"'"
                });
                this.res.end();
            }
        }
        //判断是否为主观题
        if(type!=2){

            this.res.writeHead(302, {
                'Location': "/lavico/score/showTheme?scoreAll="+scoreAll+"&optionID="+optionID+"&_id="+_id+"&chooseID="+chooseID+"&chooseNext="+chooseNext
                });
            this.res.end();
        }else{
            this.res.writeHead(302, {
                'Location': "/lavico/score/showTheme?scoreAll="+scoreAll+"&optionID="+optionID+"&_id="+_id+"&chooseNext="
                });
            this.res.end();
        }

      }
    /*
    actions:{
        fontCount:{
            var _id=seed._id;
            var optionID=seed.optionID;
            var chooseNext=seed.chooseNext;
            var scoreAll=seed.scoreAll;
            var chooseID=seed.chooseID;
            var resultValue=seed.resultValue;
            var type=seed.type;
            var isFinish=seed.isFinish;

            process:function(seed,nut){
                helper.db.coll("lavico/themeQuestion").findOne({{"themeId":_id, "custId":"cust101"}}).toArray(function(err,doc){
                    var maxFont=doc.answerRange.minCount;
                    var minFont=doc.answerRange.maxCount;

                });
            }
        }
    }
    */
}

function createTime(){
    var d = new Date();
    var vYear = d.getFullYear();
    var vMon = d.getMonth() + 1;
    var vDay = d.getDate();
    s=vYear+"-"+(vMon<10 ? "0" + vMon : vMon)+"-"+(vDay<10 ? "0"+ vDay : vDay);
    return s;
}