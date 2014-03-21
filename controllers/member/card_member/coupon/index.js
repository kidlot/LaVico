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
        var wxid = seed.wxid ? seed.wxid :'undefined';//预先定义微信ID
        nut.model.wxid = wxid;

        if(wxid !='undefined'){

            this.step(function(){

                //根据微信ID获取到获取用户的MEMBER_ID
                helper.db.coll('welab/customers').findOne({wechatid:wxid},this.hold(function(err, doc){
                    console.log(doc);
                    return doc;
                }));

            });

            this.step(function(doc){

                var data = doc ? doc : {};
                if (data == {}){
                    this.terminate();
                }
                
            });

            this.step(function(){

                var member_id = 9121535;
                nut.model.memeber_id = member_id;
                middleware.request( "/lavico.middleware/Coupons",{
                    'MEMBER_ID' : member_id
                },this.hold(function(err,doc){

                    var couponData = JSON.parse(doc);
                    coupons = couponData.coupons;
                    nut.model.coupons = couponData.coupons;

                    console.log(couponData);
                    var ineffectiveCoupons = [];//未生效的 01
                    var effectiveCoupons = [];//已生效的02
                    var usedCoupons = [];//已使用的03
                    var overdueCoupons = [];//已到期失效 04
                    var errorCoupons = [];//错误

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
                        //foreach End
                    }

                    nut.model.ineffectiveCoupons = ineffectiveCoupons;
                    nut.model.ineffectiveCouponsLength = ineffectiveCoupons.length;
                    nut.model.effectiveCoupons = effectiveCoupons;//可使用
                    nut.model.effectiveCouponsLength = effectiveCoupons.length;
                    nut.model.usedCoupons = usedCoupons;//已使用
                    nut.model.usedCouponsLength = usedCoupons.length;

                    nut.model.overdueCoupons = overdueCoupons;//已过期
                    nut.model.overdueCouponsLength = overdueCoupons.length;



                }));

            });


        }


    },
    viewIn:function(){

        //先判断是否存在微信ID参数
        var wxid = $('#wxid').val();
        if(wxid =='undefined'){
            alert('请登陆微信后，查看本页面');
            jQuery('.ocview').hide();
        }



    }
}