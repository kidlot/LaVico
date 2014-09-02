/**
 * Created by root on 14-5-6.
 */
module.exports={
    layout:"lavico/layout",
    view:"lavico/templates/answerQuestion/mantest_getGift.html",
    process:function(seed,nut){
        nut.model.getActivities=seed.getActivities;
        nut.model.wxid = seed.wxid;
        nut.model.stuas= seed.stuas ? seed.stuas :"false";
        var volumename = seed.volumename;
        var promotion_name;
        var code = seed.code ? seed.code :"undefined";
        var type = seed.type ? seed.type :"undefined";
        nut.model.parm = seed.parm || "undefined";
        nut.model.type = type;
        var memberID;//memberID
        var themetype = seed.themetype ? seed.themetype :"undefined";
        var id = seed.id ? seed.id :"undefined";
        var docs;


        this.step(function () {
            helper.db.coll("welab/customers").findOne({wechatid: seed.wxid},
                this.hold(function (err, result) {
                    if (err) throw err;
                    if (result) {
                        nut.model.memberID = result.HaiLanMemberInfo.memberID;
                        memberID =  result.HaiLanMemberInfo.memberID
                    }
                })
            )
        })

        this.step(function(){
            console.log(seed.wxid)
            console.log(themetype)
            console.log(id)
            console.log(typeof (nut.model.memberID))
            if(themetype!="undefined" && id !="undefined"){
                helper.db.coll("lavico/custReceive").find({"themeId":helper.db.id(id),"memberId":""+nut.model.memberID,"wechatid":seed.wxid,
                    "themetype":themetype,"isFinish":true} ).toArray(this.hold(function(err,doc){
                    if(err) throw err;
                    if(doc){
                        docs = doc;
                    }
                    if(doc.length==0){
                        ok=true;
                    }else{
                        ok = false;
                    }
                }))
            }
        })

        this.step(function(){
            if(type!="-1"){
                if(code!="undefined" && code!="no" && code!="-1"){
                    helper.db.coll("lavico/activity").findOne({"aid":code},this.hold(function(err,result){
                        if(err) throw err;
                        if(result){
                            nut.model.pic = result.pic;
                            promotion_name = result.promotion_name;
                        }else{
                            nut.model.pic = "undefined";
                            promotion_name = "您没有获得任何礼券";
                        }

                    }))
                }else{
                    nut.model.pic = "undefined";
                    promotion_name = "您没有获得任何礼券";
                }
            }else{
                var sa;
                var resultList=[];
                console.log(docs)
                if(docs){
                    for(var i=0;i<docs.length;i++){
                        if(docs.type!="0"){
                            sa = docs[i];
                        }
                    }
                    console.log(sa)
                    if(sa){

                        resultList.push(sa);
                        nut.model.jsonResult =resultList;
                        nut.model.label =resultList[0].getLabel;
                        nut.model.code =resultList[0].type;
                        nut.model.score = "0";
                        nut.model.sta = "false";
                        nut.model.name = "";
                        nut.model.pic = "undefined";
                    }else{
                        var results={};
                        results.getLabel = "对不起,您没有获得任何奖励";
                        results.getScore = 0;
                        results.getTipContent = "对不起,您没有获得任何奖励";
                        results.code = "undefined";
                        results.getActivities = "您没有获得任何礼券";
                        results.volumename = "您没有获得任何礼券";
                        resultList.push(results);
                        nut.model.jsonResult =  resultList
                        nut.model.score = "0";
                        nut.model.sta = "true";
                        nut.model.label =resultList[0].getLabel;
                        nut.model.code =resultList[0].type;
                        nut.model.name = "";
                        nut.model.pic = "undefined";
                    }
                }
            }
        })

        this.step(function(){
            if(type!="-1"){
                if(volumename=="undefined"){
                    nut.model.name = promotion_name;
                }else{
                    nut.model.name = volumename;
                }
            }
        })
    }
}
