module.exports={
    layout:"lavico/layout",
    view:"lavico/templates/answerQuestion/Filter.html",
    process:function(seed,nut){
        var id = seed._id;
        var wxid = seed.wechatid;
        nut.model.ids = id;
        nut.model.wxid = wxid;
        var memberid = seed.memberid;



        this.step(function(){
            if(memberid!="undefined"){
                helper.db.coll("lavico/custReceive").count({"themeId":helper.db.id(id),"memberId":memberid},this.hold(function(err,doc){
                    if(err) throw err;
                    if(doc<=0){
                        this.res.writeHead(302, {'Location': "/lavico/answerQuestion/answer?_id="+id+"&optionId=1&wechatid="+wxid});
                        this.res.end();
                    }
                }))
            }
        })

        helper.db.coll("lavico/themeQuestion").findOne({"_id":helper.db.id(id)},this.hold(function(err,doc){
            if(err) throw err
            if(doc)	nut.model.docs=doc;
        }));
    }
}