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
            if(memberid!="undefined"){
                helper.db.coll("lavico/custReceive").count({"themeId":helper.db.id(seed._id),"memberId":memberid},this.hold(function(err,doc){
                    if(err) throw err;
                    if(doc<=0){
                        this.res.writeHead(302, {'Location': "/lavico/answerQuestion/answer?_id="+seed._id+"&optionId=1&wechatid="+wxid});
                        this.res.end();
                    }
                }))
            }
        })

        this.step(function(){
            console.log(seed._id);
            helper.db.coll("lavico/themeQuestion").findOne({"_id":helper.db.id(seed._id)},this.hold(function(err,doc){
                if(err) throw err
                if(doc){
                    nut.model.docs=doc;
                }
            }));
        })

    }

}