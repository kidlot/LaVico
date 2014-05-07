/**
 * Created by root on 14-5-5.
 */
module.exports= {
    layout: "lavico/layout",
    view:"lavico/templates/answerQuestion/answer_num1.html",
    process:function(seed,nut){
       //http://{host}/lavico/answerQuestion/answer?_id=58172618&optionId=1&wechatId=asdfsf
        nut.model.wechatId=seed.wechatId;
        nut.model._id=seed._id;
    }
}