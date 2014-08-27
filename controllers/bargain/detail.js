var middleware = require('lavico/lib/middleware.js');//引入中间件
module.exports = {

    layout: "lavico/layout"
	, view: "lavico/templates/bargain/detail.html"

    , process: function(seed,nut)
    {
        var doc = {};
        //david.xu parm:01 先注册后游戏(必须关注且注册)（前置）
        //david.xu parm:02 先游戏后注册(必须关注)（后置）
        //david.xu parm:03 先游戏后不提示注册（不要求关注和注册）
        var parm = '01';
        var showFollowDialog;
        var showRegisterDialog;
        var isVip;

        this.res.setHeader("Cache-Control", "no-cache");
        this.res.setHeader("Cache-Control", "no-store");
        this.res.setHeader("Pragma","no-cache");

        if(seed.wxid && seed._id && (seed.wxid!='{wxid}')){

            nut.model.wxid = seed.wxid
            nut.model._id = seed._id
            nut.model.memberID = false


            helper.db.coll("welab/customers").findOne({wechatid:seed.wxid},this.hold(function(err,customers){
                var customers = customers || {}

                nut.model.isVip = false
                nut.model.isFollow = customers.isFollow ? true : false;

                if(customers.HaiLanMemberInfo && customers.HaiLanMemberInfo.memberID && customers.HaiLanMemberInfo.action == "bind"){
                    nut.model.isVip = true
                    nut.model.memberID = customers.HaiLanMemberInfo.memberID
                }
            }))


            helper.db.coll("lavico/bargain").findOne({_id:helper.db.id(seed._id)},this.hold(function(err,_doc){
                doc = _doc || {}
                parm = doc.parm || '01';//流程设置
                nut.model.parm = parm;
                if(nut.model.parm=='02'){
                    doc.parmDes = '关注LaVico的用户';
                }else if(nut.model.parm=='03'){
                    doc.parmDes = '所有用户';
                }else{
                    doc.parmDes = 'LaVico会员';
                }
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

            if(parm=='01'){
                if(nut.model.isFollow){
                    showFollowDialog = false;
                }else{
                    showFollowDialog = true;
                }

                if(nut.model.isVip){
                    showRegisterDialog = false;
                }else{
                    showRegisterDialog = true;
                }
            }

            if(parm=='02'){
                if(nut.model.isFollow){
                    showFollowDialog = false;
                }else{
                    showFollowDialog = true;
                }
                showRegisterDialog = false;
            }

            if(parm=='03'){
                showFollowDialog = false;
                showRegisterDialog = false;
            }
            nut.model.showFollowDialog = showFollowDialog;
            nut.model.showRegisterDialog = showRegisterDialog;

            console.log('++++++++++++');
            console.log(parm);
            console.log('++++++++++++');
            console.log('关注窗口：'+nut.model.showFollowDialog);
            console.log('@@@@@@@@@@@@');
            console.log('注册窗口：'+nut.model.showRegisterDialog);

            var then = this;
            nut.model.jf = nut.model.doc.deductionIntegral || 0;

            if(nut.model.doc.deductionIntegral > 0&& nut.model.isVip == true&&parm=='01'){

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
            var _condition4 = {};
            if(parm == '02'||parm == '03'){
                //非注册会员
                _condition4 = {"data.productID":seed._id,wxid:seed.wxid,action:"侃价","data.step":4,"data.stat":true}
            }else{
                //注册会员
                _condition4 = {"data.productID":seed._id,memberID:nut.model.memberID,action:"侃价","data.step":4,"data.stat":true}
            }
            console.log(_condition4)

            helper.db.coll("lavico/user/logs").find(_condition4).sort({createTime:-1}).limit(1).toArray(this.hold(function(err,doc){

                console.log(doc)

                var _txt = '';
                var _url = '';
                isVip = nut.model.isVip;
                if(parm=='02'){
                    if(isVip ==false){
                        _txt = "恭喜您，你已成功侃价，请先注册为朗维高LaVico的会员后领取礼券";
                        var _encodeUlr = encodeURIComponent("/lavico/member/card_member/coupon/index?wxid="+seed.wxid);
                        _url = "/lavico/member/card_blank/register?wxid="+seed.wxid+"&go="+_encodeUlr;
                    }else{
                        _txt =  "您已成功侃价，请查看您的“专属礼券”";
                        _url = "/lavico/member/card_member/coupon/index?wxid="+seed.wxid;
                    }
                }else if(parm=='03'){
                    if(isVip ==false){
                        _txt = "恭喜您，你已成功侃价，请点击查看您的侃价礼券";
                        _url = "/lavico/member/card_blank/coupon?wxid="+seed.wxid;
                    }else{
                        _txt =  "您已成功侃价，请查看您的“专属礼券”";
                        _url = "/lavico/member/card_member/coupon/index?wxid="+seed.wxid;
                    }
                }else{
                    if(isVip ==false){
                        _txt = "恭喜您，你已成功侃价，请点击查看您的侃价礼券";
                        _url = "/lavico/member/card_blank/coupon?wxid="+seed.wxid;
                    }else{
                        _txt =  "您已成功侃价，请查看您的“专属礼券”";
                        _url = "/lavico/member/card_member/coupon/index?wxid="+seed.wxid;
                    }
                }

                if(doc.length > 0){
                     console.log({err:1,msg:_txt,url:_url});
                     nut.model.res = {err:1,msg:_txt,url:_url};
                }
                return;
            }))
        })

        // timeout
        this.step(function(){

            if(nut.model.res.err != 1){

                var _condition3 = {};
                if(parm == '02'||parm == '03'){
                    //非注册会员
                    _condition3 = {"data.productID":seed._id,wxid:seed.wxid,wxid:seed.wxid,action:"侃价","data.step":3}
                }else{
                    //注册会员
                    _condition3 = {"data.productID":seed._id,memberID:nut.model.memberID,action:"侃价","data.step":3}
                }
                console.log(_condition3)

                helper.db.coll("lavico/user/logs").find(_condition3).sort({createTime:-1}).limit(1).toArray(this.hold(function(err,doc){

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

                var _condition4 = {};
                if(parm == '02'||parm == '03'){
                    //非注册会员
                    _condition4 = {"data.productID":seed._id,wxid:seed.wxid,action:"侃价","data.step":4,"data.stat":true};
                }else{
                    //注册会员
                    _condition4 = {"data.productID":seed._id,memberID:nut.model.memberID,action:"侃价","data.step":4,"data.stat":true};
                }
                console.log(_condition4)

                helper.db.coll("lavico/user/logs").find(_condition4).count(this.hold(function(err,num){

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







