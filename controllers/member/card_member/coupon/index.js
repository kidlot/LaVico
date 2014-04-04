/**
 * Created by David Xu on 3/14/2014.
 * 专属礼券
 * 进入页面调用接口获取属于该用户的券的信息
 * 调用后台显示当季活动KV
 * 分为三个模块 1.已过期 2.可使用 3.已使用
 * controllers/member/card_member/coupon/index.js
 */

var middleware = require('lavico/lib/middleware.js');//引入中间件

module.exports = {
    layout:null,
    view:'lavico/templates/member/card_member/coupon/index.html',
    process:function(seed, nut){
        var wxid = seed.wxid;
        nut.model.wxid = wxid;
        var member_id;
        var then = this;
        this.step(function(){
            helper.db.coll('welab/customers').findOne({wechatid:wxid},this.hold(function(err, doc){
                if(doc && doc.HaiLanMemberInfo && doc.HaiLanMemberInfo.memberID ){
                  member_id =  doc.HaiLanMemberInfo.memberID;
                }
            }));

        });
        this.step(function(){
            var ineffectiveCoupons = [];//未生效的 01
            var effectiveCoupons = [];//已生效的02
            var usedCoupons = [];//已使用的03
            var overdueCoupons = [];//已到期失效 04
            var errorCoupons = [];//错误                   
             
            if(!member_id){
                nut.model.ineffectiveCoupons = ineffectiveCoupons;
                nut.model.ineffectiveCouponsLength = 0;
                nut.model.effectiveCoupons = effectiveCoupons;//可使用
                nut.model.effectiveCouponsLength = 0;
                nut.model.usedCoupons = usedCoupons;//已使用
                nut.model.usedCouponsLength = 0;
                nut.model.overdueCoupons = overdueCoupons;//已过期
                nut.model.overdueCouponsLength = 0;
                
                
                helper.db.coll("lavico/user/logs").insert(
                    {
                        'createTime':new Date().getTime(),
                        'wxid':seed.wxid,
                        'action':"check_coupon",
                        'data':{"result":"member_id not found"}
                    },
                    function(err, doc){

                    }
                );                 
                then.terminate();            
            }
            
            middleware.request( "/lavico.middleware/Coupons",{
                'MEMBER_ID' : member_id
            },this.hold(function(err,doc){
                var couponData = JSON.parse(doc);
                coupons = couponData.coupons;
                
                helper.db.coll("lavico/user/logs").insert(
                    {
                        'createTime':new Date().getTime(),
                        'wxid':seed.wxid,
                        'action':"check_coupon",
                        'data':{"result":"ok"}
                    },
                    function(err, doc){

                    }
                );                  
                
                for(var _i in coupons){
                    if(coupons[_i].status == '01'){

                        ineffectiveCoupons.push(coupons[_i]);

                    }else if(coupons[_i].status == '02'){

                        effectiveCoupons.push(coupons[_i]);

                    }else if(coupons[_i].status == '03'){

                        usedCoupons.push(coupons[_i]);

                    }else if(coupons[_i].status == '04'){

                        overdueCoupons.push(coupons[_i]);

                    }else{

                        errorCoupons.push(coupons[_i]);

                    }
                }

                nut.model.ineffectiveCoupons = ineffectiveCoupons;
                nut.model.ineffectiveCouponsLength = ineffectiveCoupons.length;
                nut.model.effectiveCoupons = effectiveCoupons;//可使用
                nut.model.effectiveCouponsLength = effectiveCoupons.length;
                nut.model.usedCoupons = usedCoupons;//已使用
                nut.model.usedCouponsLength = usedCoupons.length;

                nut.model.overdueCoupons = overdueCoupons;//已过期
                nut.model.overdueCouponsLength = overdueCoupons.length;

                //记录用户动作

            }));

        });
    }
}
