/**
 * Created by root on 14-5-5.
 */
//module.exports= {
//    layout: "lavico/layout",
//    view:"lavico/templates/answerQuestion/answer_num1.html",
//    process:function(seed,nut){
//
//        nut.model.wechatId=seed.wechatid;
//        nut.model._id=seed.wechatid;
//        var wxid=seed.wechatid;
//        var memberid;
//
//
//        this.step(function(){
//
//            helper.db.coll("welab/customers").findOne({"wechatid":wxid},this.hold(function(err,doc){
//                if(err) throw err;
//                if(doc && doc.HaiLanMemberInfo && doc.HaiLanMemberInfo.memberID && doc.HaiLanMemberInfo.action=='bind'){
//                    memberid = doc.HaiLanMemberInfo.memberID;
//                    nut.model.flag="0";
//                }else{
//                    nut.model.flag="1";
//                    memberid = "undefined";
//                }
//                nut.model.memberid = memberid;
//            }))
//        })
//
//        this.step(function(){
//            helper.db.coll("lavico/themeQuestion").findOne({"wechatid":helper.db.id(wxid)},this.hold(function(err,doc){
//                if(err) throw err
//                if(doc)
//                {
//                    nut.model.goMemberInfo=(docs.explanation).replace("{@wechatid}",seed.wechatid);
//                    nut.model.docs=doc;
//                }
//            }));
//        })
//
//    }
//
//}/**
 //* Created by root on 14-5-5.
 //*/
module.exports= {
    layout: "lavico/layout",
    view:"lavico/templates/answerQuestion/answer_num1.html",
    process:function(seed,nut){

        nut.model.wechatId=seed.wechatid;
        nut.model._id=seed.wechatid;
        var wxid=seed.wechatid;
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
            //var id = '536879ea38c23a370d000c72';
            console.log(seed._id);
            helper.db.coll("lavico/themeQuestion").findOne({"_id":helper.db.id(seed._id)},this.hold(function(err,doc){
                if(err) throw err
                if(doc)
                {
                    //nut.model.goMemberInfo=doc.explanation;
                    nut.model.docs=doc;
                }
            }));
        })

    }

}