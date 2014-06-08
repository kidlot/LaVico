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
        var coupon_no = seed.coupon_no;
        var status = seed.status;
        nut.model.wxid = wxid;//WXID
        nut.model.code = code;//活动ID
        nut.model.coupon_no = coupon_no;//优惠券码
        nut.model.status = status;
        this.step(function(){
            this.step(function (activity) {
                helper.db.coll('lavico/activity').findOne({aid: code}, this.hold(function (err, doc) {
                    if (doc) {
                        info = doc;
                        info.introduction = decodeURIComponent(info.introduction);
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
                var coupon_no = seed.coupon_no;
                var status = seed.status;
                var couponData;
                var couponArr;
                var info;
                var _couponArr = {};

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
                        'coupon_no' : coupon_no,
                        'perPage':1,
                        'pageNum':1,
                        'status':status
                    };
                    middleware.request( "Coupon/GetCoupons", requestData,this.hold(function(err,doc){

                        if(doc){
                            couponData = JSON.parse(doc);
                            couponArr  = couponData.list[0];
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
                        }else{
                            success = 'false';
                            info = 'coupon_no_no_found';
                        }

                    }));
                });

                this.step(function(){
                    /*
                    * {"total":1,"list":[
                    * {"BEGIN_DATE":1402051583000,
                    * "END_DATE":1414598399000,
                    * "COUPON_STATUS":"02",
                    * "COUPON_TYPE":"01",
                    * "COUPON_CLASS":"102",
                    * "COUPON_QTY":40,
                    * "CREAT_DATE":1402051583000,
                    * "BIND_DATE":1402051583000,
                    * "USED_DATE":null,
                    * "PROMOTION_CODE":"L2013112709",
                    * "COUPON_NO":"AVLA1404210010N38962",
                    * "MEMO":"摇一摇-轿车一辆",
                    * "SYS_MEMBER_ID":9271178,
                    * "BASE_CODE_NAME":"现金券",
                    * "row_number":1}],
                    * "perPage":1,"pageNum":1}*/

                    _couponArr.CREAT_DATE = formatTime(couponArr.CREAT_DATE);//获得时间
                    _couponArr.USED_DATE = couponArr.USED_DATE ? formatTime(couponArr.USED_DATE) : null;//已使用时间
                    _couponArr.BEGIN_DATE = formatDate(couponArr.BEGIN_DATE);//有效期开始时间
                    _couponArr.END_DATE = formatDate(couponArr.END_DATE);//有效期结束时间
                    _couponArr.COUPON_QTY = couponArr.COUPON_QTY;//金额
                    _couponArr.TYPE = couponArr.BASE_CODE_NAME;//券类别
                    _couponArr.COUPON_NO = couponArr.COUPON_NO;//券号
                    _couponArr.PROMOTION_NAME = couponArr.PROMOTION_NAME;//活动名称
                    _couponArr = JSON.stringify(_couponArr);
                });

                this.step(function(){
                    if(success == 'true'){
                        this.res.writeHead(200, { 'Content-Type': 'application/json' });
                        this.res.write('{"success":true,"info":'+_couponArr+'}');
                        this.res.end();
                    }else{
                        this.res.writeHead(200, { 'Content-Type': 'application/json' });
                        this.res.write('{"success":false,"info":"'+info+'"}');
                        this.res.end();
                    }
                });
            }
        }

    },
    viewIn:function(){
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
                type:'GET',
                dataType:'json',
                data:{
                    'wxid':$('#wxid').val(),
                    'code':$('#code').val(),
                    'coupon_no':$('#coupon_no').val(),
                    'status':$('#status').val()
                },
                success:function(data){
                    $('#loading').hide();//隐藏加载框
                    var coupon = data;
                    if(coupon.success == true){
                        var _info = coupon.info;
                        $('#coupon_des').find('.PROMOTION_NAME').html(_info.PROMOTION_NAME);
                        $('#coupon_des').find('.TYPE').html(_info.TYPE);

                        $('#coupon_des').find('.COUPON_NO').html(_info.COUPON_NO);
                        $('#coupon_des').find('.COUPON_QTY').html(_info.COUPON_QTY);

                        $('#coupon_des').find('.CREAT_DATE').html(_info.CREAT_DATE);
                        if(!_info.USED_DATE){
                            $('#coupon_des').find('.USED_DATE').hide().prev().hide().prev().hide();
                        }else{
                            $('#coupon_des').find('.USED_DATE').html(_info.USED_DATE);
                        }

                        $('#coupon_des').find('.BEGIN_DATE').html(_info.BEGIN_DATE);
                        $('#coupon_des').find('.END_DATE').html(_info.END_DATE);
                        $('#coupon_des').show();

                    }else if(activity.success == false){
                        $('#coupon_des').hide();
                        //window.popupStyle2.on("网络不稳定，请稍后再尝试",function(event){});
                    }else{
                        $('#coupon_des').hide();
                        //window.popupStyle2.on("网络不稳定，请稍后再尝试",function(event){});
                    }

                }
            });
        }
        window.getCouponInfo();
    }
}

function   formatTime(now){
    var   now = new Date(now);
    var   year=now.getFullYear();
    var   month=(now.getMonth()+1>9)?(now.getMonth()+1):('0'+(now.getMonth()+1));
    var   date=(now.getDate()>9)?now.getDate():('0'+now.getDate());
    var   hour=(now.getHours()>9)?now.getHours():('0'+now.getHours());
    var   minute=(now.getMinutes()>9)?now.getMinutes():('0'+now.getMinutes());
    var   second=(now.getSeconds()>9)?now.getSeconds():('0'+now.getSeconds());
    return   year+"年"+month+"月"+date+"日 "+hour+":"+minute+':'+second;
}
function   formatDate(now){
    var   now = new Date(now);
    var   year=now.getFullYear();
    var   month=(now.getMonth()+1>9)?(now.getMonth()+1):('0'+(now.getMonth()+1));
    var   date=(now.getDate()>9)?now.getDate():('0'+now.getDate());
    var   hour=(now.getHours()>9)?now.getHours():('0'+now.getHours());
    var   minute=(now.getMinutes()>9)?now.getMinutes():('0'+now.getMinutes());
    var   second=(now.getSeconds()>9)?now.getSeconds():('0'+now.getSeconds());
    return   year+"年"+month+"月"+date+"日";
}