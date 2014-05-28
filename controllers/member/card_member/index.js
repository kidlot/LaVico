/**
 * Created by David Xu on 3/17/14.
 * 进入会员管理页面，首先先进入本页面，然后根据不同类型的会员进入不同的页面 card_blank/index or card_member/index
 */

var middleware = require('lavico/lib/middleware.js');//引入中间件

module.exports = {
    layout:'lavico/layout',
    view:'lavico/templates/member/index.html',
    process:function(seed,nut){

        /*先判断微信id是否存在*/

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

        /*判断用户类型，申请会员卡或者绑定会员卡*/
        this.step(function(){

            nut.model.wxid = wxid;
            helper.db.coll('welab/customers').findOne({wechatid:wxid},this.hold(function(err,doc){

                var MEMBER_ID = doc.HaiLanMemberInfo ? doc.HaiLanMemberInfo.memberID : "" ;
                var bindStatus = doc.HaiLanMemberInfo ? doc.HaiLanMemberInfo.action : "undefined" ;
                var type = doc.HaiLanMemberInfo ? doc.HaiLanMemberInfo.type : "undefined";

                if(bindStatus == 'bind'){
                    nut.model.bindStatus = 'bind';
                    /*自动跳转到card_member主页*/

                }else if(bindStatus == 'unbind'){
                    nut.model.bindStatus = 'unbind';
                    /*自动跳转到card_member主页*/
                }else{
                    //undefined;
                    nut.model.bindStatus = 'unbind';
                    /*自动跳转到card_member主页*/
                }

                if(type >= 1 && type <=3){
                    nut.model.type = String(type);

                }else{
                    //undefined;
                    nut.model.type = 0;
                }


                nut.model.MEMBER_ID = MEMBER_ID;



            }));
        });

        this.step(function(){

            nut.model.wxid = wxid ;

            /*会员公告*/
            nut.model.announcement = "/lavico/announcement/showIndex?wxid="+wxid;

            /*专属礼券*/
            nut.model.coupon = "/lavico/member/card_member/coupon/index?wxid="+wxid;

            /*积分与兑换*/

            /*积分明细*/
            nut.model.points = "/lavico/member/card_member/points/index?wxid="+wxid;
            /*积分兑换*/
            nut.model.reedem = "/lavico/reedem/showList?wechatId="+wxid;

            /*消费记录*/
            //nut.model.buy = "/lavico/member/card_member/buy?wxid="+wxid;
            nut.model.buy = "/lavico/consumeDetail/details?wechatId="+wxid;

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

            /*申领会员卡*/
            nut.model.register = "/lavico/member/card_blank/register?wxid="+wxid;;

            /*绑定会员卡*/
            nut.model.bind = "/lavico/member/card_blank/bind?wxid="+wxid;

        });


    },
    viewIn:function(){

        $('#loading').hide();//隐藏加载框

        var wxid = $('#wxid').val();

        /*bind*/
        if($('#bindStatus').val() == 'bind'){
            /*计算当前用户可用的优惠券数*/
            $.ajax({
                type: "GET",
                url: "/lavico/member/index:getUserEffectiveCouponsNum",
                data: {"wxid":wxid},
                dataType: "json",
                success: function(data){
                    if(data.error == "false"){
                        var _count = data.count;
                        var _html = "("+_count+"张未使用)";
                        $('#count').html(_html);
                    }else{
                        $('#count').html('');
                    }
                }
            });

        }else{
            $('#count').html('');
        }

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
                    //console.log(couponData.list);

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
                    this.res.write('{"error":"false","count":"'+effectiveCouponsCount+'"}');
                    this.res.end();
                });


            }
        }

    }
}