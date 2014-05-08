/**
 * Created by root on 14-5-5.
 */
module.exports= {
    layout: "lavico/layout",
    view:"lavico/templates/answerQuestion/answer_num1.html",
    process:function(seed,nut){

        nut.model.wechatId=seed.wechatId;
        nut.model._id=seed._id;
        //var id = '536879ea38c23a370d000c72';
        helper.db.coll("lavico/themeQuestion").findOne({"_id":helper.db.id(seed._id)},this.hold(function(err,doc){
            if(err) throw err
            if(doc)	nut.model.docs=doc;
        }));
       //http://{host}/lavico/answerQuestion/answer?_id=58172618&optionId=1&wechatId=asdfsf
        nut.model.wechatId=seed.wechatId;
        nut.model._id=seed._id;
       //http://{host}/lavico/answerQuestion/answer?_id=58172618&optionId=1&wechatId=asdfsf
        nut.model.wechatId=seed.wechatId;
        nut.model._id=seed._id;
    }
}