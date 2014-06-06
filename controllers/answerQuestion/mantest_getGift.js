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

        this.step(function(){
            if(seed.getActivities!="undefined"||seed.getActivities!="no"){
                helper.db.coll("lavico/activity").findOne({"aid":seed.getActivities},this.hold(function(err,result){
                    if(err) throw err;
                    nut.model.pic = result.pic;
                    nut.model.name = result.promotion_name;
                }))
            }else{
                nut.model.pic = "undefined";
                nut.model.name = "您没有获得任何礼券";
            }
        })
    }
}
