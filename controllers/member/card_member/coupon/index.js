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
    layout:'lavico/member/layout',
    view:'lavico/templates/member/card_member/coupon/index.html',
    process:function(seed, nut){
        var wxid = seed.wxid;
        nut.model.wxid = wxid;
        var member_id;
        var then = this;
        var ineffectiveCoupons = [];//未生效的 01
        var effectiveCoupons = [];//已生效的02
        var usedCoupons = [];//已使用的03
        var overdueCoupons = [];//已到期失效 04
        var errorCoupons = [];//错误
        var couponData;



        this.step(function(){
            helper.db.coll('welab/customers').findOne({wechatid:wxid},this.hold(function(err, doc){
                if(doc && doc.HaiLanMemberInfo && doc.HaiLanMemberInfo.memberID && doc.HaiLanMemberInfo.action=='bind'){
                  member_id =  doc.HaiLanMemberInfo.memberID;
                }else{
                  member_id ="undefined";
                }
            }));

        });

        this.step(function(){

            if(member_id == "undefined"){
                //缺少微信ID参数，强制中断

                //直接跳转
                nut.disable();//不显示模版
//                this.res.writeHead(302, {'Location': "/lavico/member/index?wxid="+wxid});
//                this.res.end();
//                this.terminate();
                this.res.writeHead(200,{'Content-Type':'text/html;charset=utf-8'})
                this.res.write("<script>alert('请先申领会员卡或者绑定会员卡,然后参加活动!');window.location.href='/lavico/member/index?wxid="+wxid+"'</script>");
                this.res.end();
                this.terminate();
            }
        });

        this.step(function(){

            if(!member_id){
                nut.model.ineffectiveCoupons = ineffectiveCoupons;
                nut.model.ineffectiveCouponsLength = 0;
                nut.model.effectiveCoupons = effectiveCoupons;//可使用
                nut.model.effectiveCouponsLength = 0;
                nut.model.usedCoupons = usedCoupons;//已使用
                nut.model.usedCouponsLength = 0;
                nut.model.overdueCoupons = overdueCoupons;//已过期
                nut.model.overdueCouponsLength = 0;


                helper.db.coll("lavico/feeds").insert(
                    {
                        'createTime':new Date().getTime(),
                        'wxid':seed.wxid,
                        'action':"check_coupon",
                        'data':{"result":"member_id not found"}
                    },
                    function(err, doc){
                        err&console.log(doc);
                    }
                );
                then.terminate();
            }
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
                        'action':"check_coupon",
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
            //console.log(couponData);
            var _coupons = couponData.list;

            for(var _i=0;_i<_coupons.length;_i++){

                var _PROMOTION_CODE = _coupons[_i].PROMOTION_CODE;

                (function(_i){
                    helper.db.coll("lavico/activity").findOne({aid: _PROMOTION_CODE},
                        then.hold(function (err, doc) {

                                if(doc&&doc.pic){
                                    var _PIC = doc.pic;
                                }else{
                                    var _PIC = "/lavico/public/images/suit_pic02.jpg";
                                }

                                if(doc&&doc.promotion_name){
                                    var _PROMOTION_NAME = doc.promotion_name;
                                }else{
                                    var _PROMOTION_NAME = "";
                                }
                                couponData.list[_i].PIC = _PIC;

                                couponData.list[_i].COUPON_NAME = _PROMOTION_NAME;//活动和优惠券一一对应
                        }));
                })(_i);

            }

        });

        this.step(function(){

            var coupons = [];
            var _coupons = couponData.list;
            console.log(couponData.list);
            /*
             优惠券状态 01: 未生效  02: 已生效  03: 已使用  04: 已到期失效,默认 02
             */

            for(var _i=0;_i<_coupons.length;_i++){

                /*
                 *  "BEGIN_DATE"▼: 1398096000000,
                 "END_DATE": 1401551999000,
                 "COUPON_STATUS": "02",
                 "COUPON_TYPE": "01",
                 "COUPON_CLASS": "103",
                 "COUPON_QTY": NumberInt(300),
                 "CREAT_DATE": 1398307157000,
                 "BIND_DATE": 1398307157000,
                 "USED_DATE": null,
                 "PROMOTION_CODE": "L2013112709",
                 "COUPON_NO": "AVL1404240060",
                 "MEMO": " 手机号 : 18651125967",
                 "SYS_MEMBER_ID": NumberInt(9121535),
                 "row_number": NumberInt(20) */

                var _BEGIN_DATE = formatDate(_coupons[_i].BEGIN_DATE);
                var _END_DATE = formatDate(_coupons[_i].END_DATE);
                var _CREAT_DATE  = formatDate(_coupons[_i].CREAT_DATE);
                var _BIND_DATE  = formatDate(_coupons[_i].BIND_DATE);
                var _USED_DATE = _coupons[_i].USED_DATE;
                var _PROMOTION_CODE = _coupons[_i].PROMOTION_CODE;
                var _COUPON_NO = _coupons[_i].COUPON_NO;
                var _COUPON_QTY = _coupons[_i].COUPON_QTY;
                var _COUPON_TYPE;
                var _COUPON_NAME = _coupons[_i].COUPON_NAME;


                if(_coupons[_i].COUPON_TYPE =='01'){
                    _COUPON_TYPE ="现金抵用券";
                }else if(_coupons[_i].COUPON_TYPE =='02'){
                    _COUPON_TYPE ="礼品券";
                }else{
                    _COUPON_TYPE ="未识别";
                }

                var _data = {
                    "BEGIN_DATE":_BEGIN_DATE,
                    "END_DATE": _END_DATE,
                    "COUPON_STATUS": _coupons[_i].COUPON_STATUS,
                    "COUPON_TYPE": _COUPON_TYPE,
                    "COUPON_CLASS": _coupons[_i].COUPON_CLASS,
                    "COUPON_QTY": _coupons[_i].COUPON_QTY,
                    "CREAT_DATE": _CREAT_DATE,
                    "BIND_DATE": _BIND_DATE,
                    "USED_DATE": _USED_DATE,
                    "PROMOTION_CODE": _PROMOTION_CODE,
                    "COUPON_NO": _COUPON_NO,
                    "PIC":_coupons[_i].PIC,
                    "COUPON_NAME":_COUPON_NAME
                };

                coupons.push(_data);
            }

            //console.log(coupons);
            for(var _i in coupons){

                if(coupons[_i].COUPON_STATUS == '01'){

                    ineffectiveCoupons.push(coupons[_i]);

                }else if(coupons[_i].COUPON_STATUS == '02'){

                    effectiveCoupons.push(coupons[_i]);

                }else if(coupons[_i].COUPON_STATUS == '03'){

                    usedCoupons.push(coupons[_i]);

                }else if(coupons[_i].COUPON_STATUS == '04'){

                    overdueCoupons.push(coupons[_i]);

                }else{
                    errorCoupons.push(coupons[_i]);
                }
            }

            nut.model.ineffectiveCoupons = ineffectiveCoupons;
            nut.model.ineffectiveCouponsLength = ineffectiveCoupons.length;

            //可使用
            nut.model.effectiveCoupons = effectiveCoupons;
            nut.model.effectiveCouponsLength = effectiveCoupons.length;

            //console.log("effectiveCoupons:");
            //console.log(effectiveCoupons);

            //已使用
            nut.model.usedCoupons = usedCoupons;
            nut.model.usedCouponsLength = usedCoupons.length;

            //已过期
            nut.model.overdueCoupons = overdueCoupons;
            nut.model.overdueCouponsLength = overdueCoupons.length;



        });
    },
    viewIn:function(){
        $('#loading').hide();//隐藏加载框

        $('.couponBtn').each(function(){
            $(this).bind('click',function(){
                $('.couponBtn').removeClass('on');
                $(this).addClass('on');

                var _id = $(this).attr('id');

                $('.pre-box').hide();
                $('#'+_id+'Content').show();
            });
        });
    }
}
function  formatDate(now){
    var   now = new Date(now);
    var   year=now.getFullYear();
    var   month=now.getMonth()+1;
    var   date=now.getDate();
    var   hour=now.getHours();
    var   minute=now.getMinutes();
    var   second=now.getSeconds();
    return   year+"-"+month+"-"+date;
}