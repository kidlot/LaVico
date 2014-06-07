/**
 * Created by David Xu on 3/14/2014.
 * 专属礼券 之 详细介绍页面
 * 使用细则由后台编辑，含图片
 */
var middleware = require('lavico/lib/middleware.js');//引入中间件


module.exports = {
    layout: "lavico/layout",
    view: "lavico/templates/member/card_member/coupon/rule.html",
    process: function (seed, nut) {
        var wxid = seed.wxid;
        var code = seed.code;
        nut.model.wxid = wxid;//WXID
        nut.model.code = code;//活动ID
        this.step(function(){
            this.step(function (activity) {
                helper.db.coll('lavico/activity').findOne({aid: code}, this.hold(function (err, doc) {
                    if (doc) {
                        nut.model.info = doc;
                    }
                }));
            });
        });
    },
    actions:{
        getPromotionInfo:{
            layout:null,
            view:null,
            process: function (seed, nut) {
                nut.disable();
                var wxid = seed.wxid;
                var PROMOTION_CODE = seed.code;
                var activityInfo = {};
                var success = 'true';
                var info;
                nut.model.wxid = seed.wxid;
                nut.model.code = seed.code;

                this.step(function(){
                    this.step(function (activity) {
                        helper.db.coll('lavico/activity').findOne({aid: PROMOTION_CODE}, this.hold(function (err, doc) {
                            if (doc) {
                                activityInfo = JSON.stringify(doc);
                            }else{
                                success = 'false';
                                info = 'activity_is_null';
                            }
                        }));
                    });
                });

                this.step(function(){
                    if(success == 'true'){
                        this.res.writeHead(200, { 'Content-Type': 'application/json' });
                        this.res.write('{"success":true,"info":'+activityInfo+'}');
                        this.res.end();
                    }else{
                        this.res.writeHead(200, { 'Content-Type': 'application/json' });
                        this.res.write('{"success":false,"info":"'+info+'"}');
                        this.res.end();
                    }
                });
            }
        },
        getCouponInfo:{
            layout:null,
            view:null,
            process: function (seed, nut) {
                nut.disable();
                var wxid = seed.wxid;
                var code = seed.code;
                var member_id;
                var success = 'true';
                nut.model.wxid = wxid;
                nut.model.code = code;

                this.step(function(){
                    //获取memberID
                    helper.db.coll('welab/customers').findOne({wechatid:wxid},this.hold(function(err, doc){


                        if(doc && doc.HaiLanMemberInfo && doc.HaiLanMemberInfo.memberID && doc.HaiLanMemberInfo.action=='bind'){
                            member_id =  doc.HaiLanMemberInfo.memberID;
                        }else{
                            success = 'false';
                        }

                    }));
                });

                this.step(function(){

                    var requestData = {
                        'promotionCode':code,
                        'memberId' : member_id,
                        'perPage':10000,
                        'pageNum':1,
                    };
                    middleware.request( "Coupon/GetCoupons", requestData,this.hold(function(err,doc){

                        couponData = JSON.parse(doc);

                        couponArr  = couponData.list;
                        //nut.model.ineffectiveCouponsLength = couponData.total;

                        helper.db.coll("welab/feeds").insert(
                            {
                                'createTime':new Date().getTime(),
                                'wxid':wxid,
                                'action':"check_coupon_detail",
                                'request':requestData,
                                'reponse':couponData
                            },this.hold( function(err, doc){
                                err&console.log(doc);
                            })
                        );
                        //记录用户动作
                        console.log(couponData);
                    }));
                });
            }
        }

    },
    viewIn:function(){
        $('#loading').hide();
        /*掩藏分享按钮*/
        window.hideShareButtion.on();

        //请求活动信息
        window.init = function(){
            //请求活动信息
            $.ajax({
                url:'/lavico/member/card_member/coupon/rule:getPromotionInfo',
                type:'POST',
                dataType:'json',
                data:{
                    'wxid':$('#wxid').val(),
                    'code':$('#code').val(),
                },
                success:function(data){
                    $('#loading').hide();//隐藏加载框
                    var activity = data;
                    if(activity.success == true){
                        console.log(activity.info);
                        var _info = activity.info;
                        $('#promotion_image').attr('src',_info.pic);
                        $('#promotion_des').html(_info.introduction);
                    }else if(activity.success == false){
                        window.popupStyle2.on("网络不稳定，请稍后再尝试",function(event){});
                    }else{
                        window.popupStyle2.on("网络不稳定，请稍后再尝试",function(event){});
                    }

                }
            });
        }
        //请求活动信息

        window.getCouponInfo = function(){
            //请求活动信息
            $.ajax({
                url:'/lavico/member/card_member/coupon/rule:getCouponInfo',
                type:'POST',
                dataType:'json',
                data:{
                    'wxid':$('#wxid').val(),
                    'code':$('#code').val(),
                },
                success:function(data){
                    $('#loading').hide();//隐藏加载框
                    var activity = data;
                    if(activity.success == true){

                    }else if(activity.success == false){
                        window.popupStyle2.on("网络不稳定，请稍后再尝试",function(event){});
                    }else{
                        window.popupStyle2.on("网络不稳定，请稍后再尝试",function(event){});
                    }

                }
            });
        }
        //window.getCouponInfo();
    }
}