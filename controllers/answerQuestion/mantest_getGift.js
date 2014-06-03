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
    }
}
