/**
 * Created by root on 14-5-5.
 */
module.exports= {
    layout: "lavico/layout",
    view:"lavico/templates/answerQuestion/answer_num1.html",
    process:function(seed,nut){

        nut.model.wechatId=seed.wxid;
        nut.model._id=seed._id;
        //var id = '536879ea38c23a370d000c72';
        helper.db.coll("lavico/themeQuestion").findOne({"_id":helper.db.id(seed._id)},this.hold(function(err,doc){
            if(err) throw err
            if(doc)	nut.model.docs=doc;
        }));
    }
}