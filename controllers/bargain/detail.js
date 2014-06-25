var middleware = require('lavico/lib/middleware.js');//引入中间件
module.exports = {

    layout: "lavico/layout"
	, view: "lavico/templates/bargain/detail.html"

    , process: function(seed,nut)
    {
        var doc = {};

        this.res.setHeader("Cache-Control", "no-cache");
        this.res.setHeader("Cache-Control", "no-store");
        this.res.setHeader("Pragma","no-cache");

        if(seed.wxid && seed._id){

            nut.model.wxid = seed.wxid
            nut.model._id = seed._id
            nut.model.memberID = false


            helper.db.coll("welab/customers").findOne({wechatid:seed.wxid},this.hold(function(err,customers){
                var customers = customers || {}

                nut.model.isVip = false
                if(customers.HaiLanMemberInfo && customers.HaiLanMemberInfo.memberID && customers.HaiLanMemberInfo.action == "bind"){
                    nut.model.isVip = true
                    nut.model.memberID = customers.HaiLanMemberInfo.memberID
                }
            }))


            helper.db.coll("lavico/bargain").findOne({_id:helper.db.id(seed._id)},this.hold(function(err,_doc){
                doc = _doc || {}
                nut.model.doc = doc
            }))


        }else{
            nut.disable();
            var data = JSON.stringify({err:1,msg:"没有微信ID或产品ID"});
            this.res.writeHead(200, { 'Content-Type': 'application/json' });
            this.res.write(data);
            this.res.end();
            this.terminate()
        }


        nut.model.bargainStatus = "";

        // 查询剩余积分
        this.step(function(){

            var then = this;
            nut.model.jf = nut.model.doc.deductionIntegral || 0;

            if(nut.model.doc.deductionIntegral){

                middleware.request("Point/" + nut.model.memberID,
                    {memberId: nut.model.memberID},
                    this.hold(function (err, doc) {

                        console.log("剩余积分",doc)
                        if(parseInt(JSON.parse(doc).point) < parseInt(nut.model.doc.deductionIntegral)){

                            nut.model.bargainStatus = "您的积分不够了，快去朗维高门店消费或者参加抢积分活动吧！"
                        }
                    }));
            }
        })

        // 判断有效期
        this.step(function(){


            if(new Date().getTime() > nut.model.doc.stopDate ){

                nut.model.bargainStatus = "很抱歉，活动已结束"
            }
            if(new Date().getTime() < nut.model.doc.startDate ){

                nut.model.bargainStatus = "很抱歉，活动还没有开始"
            }
            if(nut.model.doc.switcher=="off" ){

                nut.model.bargainStatus = "很抱歉，活动已结束"
            }
        })

        nut.model.res = {}
        // repeat
        this.step(function(){

            console.log({"data.productID":seed._id,memberID:nut.model.memberID,action:"侃价","data.step":4,"data.stat":true})
            helper.db.coll("lavico/user/logs").find({"data.productID":seed._id,memberID:nut.model.memberID,action:"侃价","data.step":4,"data.stat":true}).sort({createTime:-1}).limit(1).toArray(this.hold(function(err,doc){

                console.log(doc)
                if(doc.length > 0){

                    nut.model.res = {err:1,msg:"您已成功侃价，请查看您的“专属礼券”",url:"/lavico/member/card_member/coupon/index?wxid="+seed.wxid};
                }
                return;
            }))
        })

        // timeout
        this.step(function(){

            if(nut.model.res.err != 1){

                helper.db.coll("lavico/user/logs").find({"data.productID":seed._id,memberID:nut.model.memberID,action:"侃价","data.step":3}).sort({createTime:-1}).limit(1).toArray(this.hold(function(err,doc){

                    if(doc.length > 0){
                        var timeout = 60 * 3 * 1000
                        //10分钟改为3分钟

                        if( doc[0].createTime + timeout > new Date().getTime()){
                            nut.model.res = {err:1,msg:"休息休息，3分钟后才能再侃价"};
                        }
                    }
                    return;
                }))
            }
        })


        // max
        this.step(function(){

            if(nut.model.res.err != 1){
                helper.db.coll("lavico/user/logs").find({"data.productID":seed._id,memberID:nut.model.memberID,action:"侃价","data.step":4,"data.stat":true}).count(this.hold(function(err,num){

                    if(num >= doc.surplus){
                        nut.model.res = {err:1,msg:"此商品已销售完毕，请选其它商品。"};
                    }
                    return;
                }))
            }
        })
        this.step(function(){

            if(nut.model.res.err != 1){
                nut.model.res = {err:0};
            }
            console.log(nut.model.res)
        })

    }
}







