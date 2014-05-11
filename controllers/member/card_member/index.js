/**
 * 会员 - 我的会员卡 (已开卡状态)
 * 接口查询：会员卡号、卡类型、未使用的礼券、信息完善与否
 * url:/lavico/member/card_member/index
 * template:/lavico/templates/member/card_member/index.html
 */

var middleware = require('lavico/lib/middleware.js');//引入中间件

module.exports = {
    layout:'lavico/member/layout',
    view:'lavico/templates/member/card_member/index.html',
    process:function(seed,nut){

        var wxid = seed.wxid ? seed.wxid : 'undefined';//预先定义微信ID

        this.step(function(){
            if(wxid == 'undefined'){
                nut.disable();//不显示模版
                this.res.writeHead(200, { 'Content-Type': 'application/json' });
                this.res.write('{"error":"wxid_is_empty"}');
                this.res.end();
                this.terminate();
            }
        });
        this.step(function(){
            helper.db.coll('welab/customers').findOne({wechatid:wxid},this.hold(function(err, doc){
                if(!doc){
                    nut.disable();//不显示模版
                    this.res.writeHead(200, { 'Content-Type': 'application/json' });
                    this.res.write('{"error":"wxid_no_bind_to_welab"}');
                    this.res.end();
                    this.terminate();
                }
            }));
        });
        this.step(function(){

            nut.model.wxid = wxid ;

            /*会员公告*/
            nut.model.announcement = "/lavico/announcement/showIndex?wxid="+wxid;

            /*专属礼券*/
            nut.model.coupon = "/lavico/member/card_member/coupon/index?wxid="+wxid;

            /*积分与兑换*/
            nut.model.points = "/lavico/member/card_member/points/index?wxid="+wxid;

            /*消费记录*/
            nut.model.buy = "/lavico/member/card_member/buy?wxid="+wxid;

            /*收藏清单*/
            nut.model.fav = "/lavico/lookbook/favorites?wxid="+wxid;


            /*会员特权*/

            /*微会员尊享*/
            nut.model.weiCard = "/lavico/member/benefit/index:weiCard?wxid="+wxid;
            /*VIP尊享*/
            nut.model.vipCard = "/lavico/member/benefit/index:vipCard?wxid="+wxid;
            /*白金VIP卡尊享*/
            nut.model.goldCard = "/lavico/member/benefit/index:goldCard?wxid="+wxid;

            /*个人资料*/
            nut.model.info = "/lavico/member/card_member/info?wxid="+wxid;

            /*解绑会员卡*/
            nut.model.unbind = "/lavico/member/card_member/unbind?wxid="+wxid;

            /*门店地址*/
            nut.model.store = "/lavico/store/currentCustomerLocation?wxid="+wxid;

        });

    },
    actions:{
        getUserEffectiveCouponsNum:{
            layout:null,
            view:null,
            process:function(seed,nut){
                nut.disable();
                var wxid = seed.wxid || 'undefined';
                var couponData;

                this.step(function(){
                    if(wxid == 'undefined'){
                        nut.disable();//不显示模版
                        this.res.writeHead(200, { 'Content-Type': 'application/json' });
                        this.res.write('{"error":"wxid_is_empty"}');
                        this.res.end();
                        this.terminate();
                    }
                });

                this.step(function(){
                    helper.db.coll('welab/customers').findOne({wechatid:wxid},this.hold(function(err, doc){
                        if(!doc){
                            nut.disable();//不显示模版
                            this.res.writeHead(200, { 'Content-Type': 'application/json' });
                            this.res.write('{"error":"wxid_no_bind_to_welab"}');
                            this.res.end();
                            this.terminate();
                        }
                    }));
                });

                this.step(function(){
                    helper.db.coll('welab/customers').findOne({wechatid:wxid},this.hold(function(err, doc){
                        if(doc && doc.HaiLanMemberInfo && doc.HaiLanMemberInfo.memberID ){
                            member_id =  doc.HaiLanMemberInfo.memberID;
                        }else{
                            nut.disable();//不显示模版
                            this.res.writeHead(200, { 'Content-Type': 'application/json' });
                            this.res.write('{"error":"member_id_is_empty"}');
                            this.res.end();
                            this.terminate();
                        }
                    }));
                });
                this.step(function(){

                    var requestData = {
                        'memberId' : member_id,
                        'perPage':10000,
                        'pageNum':1
                    };

                    middleware.request( "Coupon/GetCoupons", requestData,this.hold(function(err,doc){

                        couponData = JSON.parse(doc);

                        helper.db.coll("welab/feeds").insert(
                            {
                                'createTime':new Date().getTime(),
                                'wxid':seed.wxid,
                                'action':"check_effective_coupon_num",
                                'request':requestData,
                                'reponse':couponData
                            },this.hold( function(err, doc){
                                err&console.log(doc);
                            })
                        );
                        //记录用户动作
                    }));

                });
                this.step(function(){

                    var coupons = couponData.list;
                    var effectiveCouponsCount = 0;
                    console.log(couponData.list);

                    /*
                     优惠券状态 01: 未生效  02: 已生效  03: 已使用  04: 已到期失效,默认 02
                     */
                    for(var _i in coupons){
                        if(coupons[_i].COUPON_STATUS == '02'){
                            effectiveCouponsCount ++;
                        }
                    }

                    nut.disable();//不显示模版
                    this.res.writeHead(200, { 'Content-Type': 'application/json' });
                    this.res.write('{"error":"false","count:"'+effectiveCouponsCount+'}');
                    this.res.end();
                });


            }
        }

    }
    ,viewIn:function(){

        var wxid = $('#wxid').val();
//        $.ajax({
//            type: "GET",
//            url: "/lavico/member/card_member/index:getUserEffectiveCouponsNum",
//            data: {"wxid":wxid},
//            dataType: "json",
//            success: function(data){
//                console.log(data);
//            }
//        });

    },

}