/**
 * Created by David Xu on 5/9/14.
 */
var middleware = require('../../lib/middleware.js');
module.exports = {
    layout: "lavico/layout",
    view: "lavico/templates/activity/shake_end02.html",
    process:function(seed,nut){

        var uid = seed.uid || 'undefined';//用户微信ID
        var aid = seed.aid || 'undefined';//表lavico/shake，唯一确定shake的活动,也就是_id
        var PROMOTION_CODE = seed.activity || 'undefined';
        var coupon_no = seed.coupon_no || 'undefined';//优惠券
        var lottery_info = {};
        var memberId;
        var url;
        var time = (new Date()).getTime();
        nut.model.time = time;

        this.step(function(){
            if(uid == 'undefined'){
                nut.disable();//不显示模版
                this.res.writeHead(200, { 'Content-Type': 'application/json' });
                this.res.write('{"error":"wxid_is_empty"}');
                this.res.end();
                this.terminate();
            }

            if(aid == 'undefined'){
                nut.disable();//不显示模版
                this.res.writeHead(200, { 'Content-Type': 'application/json' });
                this.res.write('{"error":"aid_is_empty"}');
                this.res.end();
                this.terminate();
            }

            if(coupon_no == 'undefined'){
                nut.disable();//不显示模版
                this.res.writeHead(200, { 'Content-Type': 'application/json' });
                this.res.write('{"error":"coupon_no_is_empty"}');
                this.res.end();
                this.terminate();
            }
        });
        this.step(function(){

            helper.db.coll('welab/customers').findOne({wechatid:uid},this.hold(function(err, doc){
                if(!doc){
                    nut.disable();//不显示模版
                    this.res.writeHead(200, { 'Content-Type': 'application/json' });
                    this.res.write('{"error":"wxid_no_bind_to_welab"}');
                    this.res.end();
                    this.terminate();
                }else{

                    if(doc&&doc.HaiLanMemberInfo&&doc.HaiLanMemberInfo.action=='bind'){
                        memberId = doc.HaiLanMemberInfo.memberID;
                        nut.model.bind = 'true';
                        console.log(memberId);
                        url="/lavico/member/card_member/coupon?wxid="+uid;
                    }else{
                        memberId = "undefined";
                        nut.model.bind = 'false';
                        url="/lavico/member/card_blank/register?wxid="+uid;
                    }
                    nut.model.url = url;
                }
            }));
        });

        this.step(function(){

            helper.db.coll('lavico/shake').findOne({_id:helper.db.id(aid)},this.hold(function(err, doc){
                if(!doc){
                    nut.disable();//不显示模版
                    this.res.writeHead(200, { 'Content-Type': 'application/json' });
                    this.res.write('{"error":"aid_no_bind_to_welab"}');
                    this.res.end();
                    this.terminate();
                }else{

                    for(var _i=0;_i<doc.lottery.length;_i++){
                        if(doc.lottery[_i].PROMOTION_CODE == PROMOTION_CODE){
                            lottery_info = doc.lottery[_i];
                        }
                    }
                    nut.model.lottery_info = lottery_info;
                }
            }));
        });

        this.step(function(){
            nut.model.uid = uid;
        });



    },
    viewIn:function(){
        /*掩藏分享按钮*/
        window.hideShareButtion.on();

    }
}