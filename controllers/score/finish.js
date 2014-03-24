module.exports={
    layout:null,
    view:"lavico/templates/score/finish.html",
    process:function(seed,nut){
        var _id=seed._id;//题组编号
        var optionID=seed.optionID;//用户正在做的第N题
        var chooseNext=seed.chooseNext;
        var type=seed.type;//?
        var scoreAll=seed.scoreAll;
        helper.db.coll("lavico/themeQuestion").findOne({"_id":helper.db.id(_id)},this.hold(function(err,doc){
            for(var i=0;i<doc.scoreMinMax.length;i++){
                var min=doc.scoreMinMax[i].conditionMinScore;
                var max=doc.scoreMinMax[i].conditionMaxScore;
                if(scoreAll>min && scoreAll<max || chooseNext==doc.scoreMinMax[i].conditionLabel){
                                helper.db.coll("lavico/custReceive").insert({
                                    "custId": "cust101",
                                    "themeId": _id,
                                    "isFinish": true,
                                    "getScore": parseInt(scoreAll),
                                    "getLabel": doc.scoreMinMax[i].getLabel,
                                    "getGift":  doc.scoreMinMax[i].getGift,
                                    "compScore":  doc.scoreMinMax[i].compScore,
                                    "createTime": createTime(),
                                    "receiveTime": ""
                                },function(err,doc){
                                });
                }
            }

            nut.model.scroeMinMax=JSON.stringify(doc.scoreMinMax);
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