var middleware = require('lavico/lib/middleware.js');//引入中间件
module.exports = {
    layout: "lavico/layout",
    view: "lavico/templates/reedem/member_num19.html",
    process: function (seed, nut) {

        var wxid = seed.wxid ? seed.wxid : 'undefined';
        var id = seed._id;
        nut.model.memberId=seed.memberId;
        nut.model.needScore=seed.needScore;
        nut.model.wechatId=seed.wechatId;
        nut.model.point=seed.point;//当前积分
        nut.model.aid=seed.aid;
        nut.model.wxid=wxid;
        nut.model._id=id;

        nut.model.wxid = wxid;

        this.step(function(){
            helper.db.coll("lavico/reddem").findOne({"_id": helper.db.id(id)}, this.hold(function (err, doc) {
                if (err) throw err;
                nut.model.doc = doc;

            }))
        })


        this.step(function(){
            helper.db.coll("welab/customers").findOne({"wechatid":seed.wechatId},this.hold(function(err,doc){
                if(err) throw err;
                if(doc){
                    if(doc.HaiLanMemberInfo) {
                        if (doc.HaiLanMemberInfo.action == "bind") {
                            //已绑定
                            nut.model.isReg = "1";
                            return doc;
                        } else {
                            //未绑定
                            nut.model.isReg = "0";
                        }
                    }
                }else{
                    //未注册
                    nut.model.isReg="0";
                }
            }))
        })

        this.step(function(doc){
            if(doc){
                if(parseInt(seed.point)<parseInt(seed.needScore)){
                    nut.model.isReg="2";
                }
            }
        })
    }
}