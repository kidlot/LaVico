module.exports = {
    layout: "lavico/layout",
    view: "lavico/templates/bargain/list.html",
    process: function(seed,nut){

        var then = this;
        var memberId = false;
        var list = [];
        nut.model.wxid = seed.wxid;

        this.step(function(){
            //David.xu at 2014-07-03
            helper.db.coll("welab/customers").findOne({wechatid:seed.wxid},this.hold(function(err,customers){
                var customers = customers || {}

                nut.model.isVip = false;
                if(customers.HaiLanMemberInfo && customers.HaiLanMemberInfo.memberID && customers.HaiLanMemberInfo.action == "bind"){
                    nut.model.isVip = true;
                    memberId = customers.HaiLanMemberInfo.memberID;
                }
            }))

        });

        this.step(function(){
            //David.xu at 2014-07-03
            /*
            * 侃价列表页面，区分当前用户是否已侃过某个商品
            * @bargainSuccess false 默认没有侃过
            * @bargainSuccess true 侃过
            * */

            helper.db.coll("lavico/bargain").find({switcher:"on",startDate:{$lt:new Date().getTime()},stopDate:{$gt:new Date().getTime()}}).sort({orderId:1}).toArray(this.hold(function(err,docs){
                list = docs;
                if(nut.model.isVip){
                    for(var i=0;i<list.length;i++){
                        var _id = String(docs[i]._id);
                        docs[i].bargainSuccess = false;
                        (function(_this,i,_id){
                            helper.db.coll("lavico/user/logs").find({"data.productID":_id,"memberID":memberId,"action":"侃价","data.step":4,"data.stat":true}).sort({createTime:-1}).limit(1).toArray(_this.hold(function(err,doc){

                                if(doc[0]){
                                    console.log(doc);
                                    console.log(list[i].name);
                                    list[i].bargainSuccess = true;
                                }
                            }))
                        })(this,i,_id);
                    }
                }
            }));
        });

        this.step(function(docs){

            //David.xu at 2014-07-03
            nut.model.list = list;

        });

    }
}







