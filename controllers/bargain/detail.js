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
        }

        nut.model.res = {}

        // repeat
        this.step(function(){

            helper.db.coll("lavico/user/logs").find({"data.productID":seed._id,memberID:nut.model.memberID,action:"侃价","data.step":3,"data.stat":true}).sort({createTime:-1}).limit(1).toArray(this.hold(function(err,doc){

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

                helper.db.coll("lavico/user/logs").find({"data.productID":seed._id,memberID:nut.model.memberID,action:"侃价","data.step":2}).sort({createTime:-1}).limit(1).toArray(this.hold(function(err,doc){

                    if(doc.length > 0){
                        var timeout = 60 * 10 * 1000

                        if( doc[0].createTime + timeout > new Date().getTime()){
                            nut.model.res = {err:1,msg:"休息休息，10分钟后才能再侃价"};
                        }
                    }
                    return;
                }))
            }
        })


        // max
        this.step(function(){

            if(nut.model.res.err != 1){
                helper.db.coll("lavico/user/logs").find({"data.productID":seed._id,memberID:nut.model.memberID,action:"侃价","data.step":3,"data.stat":true}).count(this.hold(function(err,num){

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







