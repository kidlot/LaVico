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

        this.step(function(){
            if(seed.getActivities!="undefined" && seed.getActivities!="no" && seed.getActivities!="-1"){
                helper.db.coll("lavico/activity").findOne({"aid":seed.getActivities},this.hold(function(err,result){
                    if(err) throw err;
                    nut.model.pic = result.pic;
                    promotion_name = result.promotion_name;
                }))
            }else{
                nut.model.pic = "undefined";
                promotion_name = "您没有获得任何礼券";
            }
        })

        this.step(function(){
            if(volumename=="undefined"){
                nut.model.name = promotion_name;
            }else{
                nut.model.name = volumename;
            }
        })
    }
}
