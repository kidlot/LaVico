/**
 * Created by David Xu on 5/9/14.
 */
var middleware = require('../../lib/middleware.js');
module.exports = {
    layout: "lavico/layout",
    view: "lavico/templates/activity/shake_end.html",
    process:function(seed,nut){

        var uid = seed.uid || 'undefined';//用户微信ID
        var _id = seed._id || 'undefined';//表lavico/shake，唯一确定shake的活动
        var aid;//在表lavico/activity唯一确定活动ID
        var coupon_no = seed.coupon_no || 'undefined';//优惠券

        this.step(function(){
            if(uid == 'undefined'){
                nut.disable();//不显示模版
                this.res.writeHead(200, { 'Content-Type': 'application/json' });
                this.res.write('{"error":"wxid_is_empty"}');
                this.res.end();
                this.terminate();
            }

            if(_id == 'undefined'){
                nut.disable();//不显示模版
                this.res.writeHead(200, { 'Content-Type': 'application/json' });
                this.res.write('{"error":"_id_is_empty"}');
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
                }
            }));
        });

        this.step(function(){

            helper.db.coll('lavico/shake').findOne({_id:helper.db.id(_id)},this.hold(function(err, doc){
                if(!doc){
                    nut.disable();//不显示模版
                    this.res.writeHead(200, { 'Content-Type': 'application/json' });
                    this.res.write('{"error":"aid_no_bind_to_welab"}');
                    this.res.end();
                    this.terminate();
                }else{
                    nut.model.doc = doc;
                    aid = doc.aid;//数据格式：L2013112709，在lavico/activity中唯一确定活动
                    console.log(doc);
                }
            }));
        });

        this.step(function(){

            helper.db.coll('lavico/activity').findOne({aid:aid},this.hold(function(err, doc){
                if(!doc){
                    nut.disable();//不显示模版
                    this.res.writeHead(200, { 'Content-Type': 'application/json' });
                    this.res.write('{"error":"aid_no_bind_to_welab"}');
                    this.res.end();
                    this.terminate();
                }else{
                    nut.model.picUrl = doc.pic || '/lavico/public/images/coupon.jpg';
                }
            }));
        });


        this.step(function(){
            nut.model.uid = uid ;
            nut.model.aid = _id;
        });



    },
    viewIn:function(){
        /*掩藏分享按钮*/
        window.hideShareButtion.on();
    }
}