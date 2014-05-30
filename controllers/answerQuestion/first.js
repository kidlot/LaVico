module.exports= {
    layout: "lavico/layout",
    view:"lavico/templates/answerQuestion/answer_num1.html",
    process:function(seed,nut){

        nut.model.wechatId=seed.wechatid;
        nut.model._id=seed.wechatid;
        var wxid=seed.wechatid;
        nut.model.fromWelab = seed.fromWelab || ""
        var memberid;

        this.step(function(){

            helper.db.coll("welab/customers").findOne({"wechatid":wxid},this.hold(function(err,doc){
                if(err) throw err;

                if(doc && doc.HaiLanMemberInfo){
                    if(doc.HaiLanMemberInfo.action=='bind') {
                        memberid = doc.HaiLanMemberInfo.memberID;
                        nut.model.flag = "0";
                    }else{
                        memberid = doc.HaiLanMemberInfo.memberID;
                        nut.model.flag="1";
                    }
                }else{
                    //未绑定
                    memberid = "undefined";
                    nut.model.flag="1";
                }
                nut.model.memberid = memberid;
            }))
        })

        this.step(function(){
            helper.db.coll("lavico/themeQuestion").findOne({"_id":helper.db.id(seed._id)},this.hold(function(err,doc){
                if(err) throw err
                if(doc){
                    nut.model.docs=doc;
                    nut.model.themeQuestion = JSON.stringify(doc);
                }
            }));
        })

        this.step(function(){
            if(memberid!="undefined"){
                helper.db.coll("lavico/custReceive").count({"themeId":helper.db.id(seed._id),"memberId":""+memberid},this.hold(function(err,doc){
                    if(err) throw err;
                    if(doc){
                        nut.model.isok = "0";
                    }else{
                        nut.model.isok = "1";
                    }
                }))

            }else{
            nut.model.isok = "1";
            }
        })

    }

}