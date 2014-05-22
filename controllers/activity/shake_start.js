/**
 * Created by David Xu on 5/9/14.
 */
var middleware = require('../../lib/middleware.js');
module.exports = {
    layout: "lavico/member/layout",
    view: "lavico/templates/activity/shake_start.html",
    process:function(seed,nut){

        /*MemberID会员判断*/

        var wxid = seed.uid ? seed.uid : 'undefined';//uid是用户的wechatid
        var aid = seed.aid ? seed.aid : 'undefined';//摇一摇活动ID
        var shakeActivity;//摇一摇活动信息

        var member_id;
        this.step(function(){
            if(wxid == 'undefined' || wxid == '{wxid}'){
                nut.disable();//不显示模版
                this.res.writeHead(200, { 'Content-Type': 'application/json' });
                this.res.write('{"error":"wxid_is_empty"}');
                this.res.end();
                this.terminate();
            }
        });

        this.step(function(){
            helper.db.coll('welab/customers').findOne({wechatid:wxid},this.hold(function(err,doc){
                if(!doc){
                    nut.disable();//不显示模版
                    this.res.writeHead(200, { 'Content-Type': 'application/json' });
                    this.res.write('{"error":"wxid_no_found"}');
                    this.res.end();
                    this.terminate();
                }
            }));
        });

        this.step(function(){

            if(wxid == 'undefined'){
                //缺少微信ID参数，强制中断
                nut.disable();//不显示模版
                this.res.writeHead(200, { 'Content-Type': 'application/json' });
                this.res.write('{"error":"wxid_is_empty"}');
                this.res.end();
                this.terminate();

            }else{

                helper.db.coll('welab/customers').findOne({wechatid:wxid},this.hold(function(err, doc){
                    if(doc && doc.HaiLanMemberInfo && doc.HaiLanMemberInfo.memberID && doc.HaiLanMemberInfo.action=='bind' ){
                        member_id =  doc.HaiLanMemberInfo.memberID;
                    }else{
                        member_id = 'undefined';
                    }
                }));

            }

        });
        this.step(function(){

            if(member_id == "undefined"){
                //缺少微信ID参数，强制中断
                //直接跳转
                nut.disable();//不显示模版
                //this.res.writeHead(302, {'Location': "/lavico/member/index?wxid="+wxid});
                this.res.writeHead(200,{'Content-Type':'text/html;charset=utf-8'})
                this.res.write("<script>alert('请先注册会员或者绑定会员,然后参加活动!');window.location.href='/lavico/member/index?wxid="+wxid+"'</script>");
                this.res.end();
                this.terminate();
            }
        });

        this.step(function(){
            if(aid == 'undefined'){
                nut.disable();//不显示模版
//              this.res.writeHead(200, { 'Content-Type': 'application/json' });
//              this.res.write('{"error":"aid_is_empty"}');
                this.res.writeHead(200,{'Content-Type':'text/html;charset=utf-8'})
                this.res.write("<script>alert('请先注册会员或者绑定会员,然后参加活动!');window.location.href='/lavico/member/index?wxid="+wxid+"'</script>");
                this.res.end();
                this.terminate();
            }
        });


        this.step(function(){
            nut.model.uid = seed.uid;//uid是用户的wechatid
            nut.model.aid = seed.aid;//摇一摇活动ID
        });

        /*MemberID会员判断*/

        /*每次积分消耗多少分，如果用户积分不够，需要提示用户。*/
        /*提示用户是否确定消耗积分*/
        this.step(function(){
            helper.db.coll('lavico/shake').findOne({_id:helper.db.id(seed.aid),switcher:'on',startDate:{$lte:new Date().getTime()},endDate:{$gte:new Date().getTime()}},this.hold(function(err,doc){
                shakeActivity = doc;
                console.log('~~~~~~~~~~~~~~~~~');
                console.log(doc);
                console.log('~~~~~~~~~~~~~~~~~');
            }));
        });

        this.step(function(){
            var _points = shakeActivity.points;
        });

    },
    actions:{
        points:{



        },
        shakeit: {
            process: function(seed,nut)
            {
                nut.disabled = true ;
                var then = this;
                if(!seed.uid || !seed.aid){
                    write_info(then,'{"result":"miss"}');
                    return;
                }
                var shake;
                var returnCount;//返回多少次机会
                this.step(function(){
                    helper.db.coll('lavico/shake').findOne({_id:helper.db.id(seed.aid),switcher:'on',startDate:{$lte:new Date().getTime()},endDate:{$gte:new Date().getTime()}},this.hold(function(err,doc){
                        shake = doc;
                        console.log('~~~~~~~~~~~~~~~~~');
                        console.log(doc);
                        console.log('~~~~~~~~~~~~~~~~~');
                    }));
                });

                this.step(function(){
                    if(!shake){
                        write_info(then,'{"result":"cannot"}');
                    }
                })

                var count=0;
                this.step(function(){
                    var start_time;
                    var now_timestamp = new Date().getTime();
                    if(shake.lottery_cycle == '1'){ // 自然天
                        start_time = now_timestamp - ( now_timestamp % 86400000 );
                    }else if(shake.lottery_cycle == '2'){// 自然周
                        start_time = now_timestamp -86400000*(new Date().getDay()) - ( now_timestamp % 86400000 );
                    }else if(shake.lottery_cycle == '3'){//自然月
                        start_time = now_timestamp -86400000*(new Date().getDate()) - ( now_timestamp % 86400000 );
                    }else if(shake.lottery_cycle == '100'){//永久
                        start_time = 0;
                    }else{
                        write_info(then,'{"result":"something-error"}');
                    }
                    helper.db.coll('shake/shake').count({uid:seed.uid,aid:seed.aid,createDate:{$gte:start_time}},this.hold(function(err,doc){
                        count = doc;
                        console.log('+++++++++++++++++');
                        console.log('now'+seed.aid+'sum:'+doc);
                        console.log('+++++++++++++++++');
                    }));
                })
                this.step(function(){

                    returnCount = shake.lottery_count - count;
                    console.log('now'+seed.aid+'can:'+shake.lottery_count);
                    console.log('now'+seed.aid+'go on getting:'+returnCount);
                    if(count >= shake.lottery_count){

                        write_info(then,'{"result":"has-no-chance"}');
                    }
                })

                this.step(function(){
                    var activity = {};
                    activity.aid = seed.aid;
                    activity.code = shake.aid;
                    activity.uid = seed.uid;
                    activity.name = shake.name;
                    activity.QTY = shake.QTY;
                    activity.points = shake.points;//每次摇一摇，所需要的积分多少
                    activity.createDate = new Date().getTime();























                    console.log(Math.floor(Math.random()*100+1));
                    console.log(shake);
                    console.log(shake.lottery);
                    if(Math.floor(Math.random()*100+1) <= shake.lottery[0].lottery_chance){
                        console.log("摇一摇领取优惠券");
                        middleware.request('Coupon/FetchCoupon',{
                            openid:seed.uid,
                            PROMOTION_CODE:shake.aid, //海澜CRM 活动代码，由 Promotions 接口返回
                            point:0,
                            otherPromId:seed.aid, //微信活动识别ID
                            memo:'摇一摇'
                        },this.hold(function(err,doc){
                            //console.log("摇一摇领取优惠券");
                            err&&console.log(doc);
                            doc = JSON.parse(doc);
                            console.log(doc);
                            if(doc.success == true){

                                activity.coupon_no = doc.coupon_no;//优惠券号码

                                helper.db.coll('welab/customers').update({wechatid:seed.uid},{$addToSet:{shake:activity}},function(err,doc){err&&console.log(doc);});

                                helper.db.coll("shake/shake").insert(activity,function(err,doc){err&&console.log(doc);});
                                write_info(then,'{"result":"win","coupon_no":"'+doc.coupon_no+'"}');
                            }else{
                                write_info(then,'{"result":"'+doc.error+'"}');
                            }

                        }))

                    }else{
                        console.log("依据概率，摇一摇没成功");
                        helper.db.coll('shake/shake').insert(activity,function(err,doc){
                            err&&console.log(doc);
                        });
                        write_info(then,'{"result":"unwin","count":"'+returnCount+'"}');
                    }
                })
            }
        }
    },
    viewIn:function(){
        /*前端设计JS*/

        $('#loading').hide();//隐藏加载框

        var flag = 1;//默认可摇一摇
        if (window.DeviceMotionEvent) {
            window.addEventListener('devicemotion',deviceMotionHandler, false);
        } else{
            alert('您的手机没法摇？那就直接点这里');
        }

        $(".mobile-btn").click(function(){

            if(flag == 1){
                mobileClickRight();
                setTimeout(function(){mobileClickLeft()},500);
                setTimeout(function(){
                    mobileClick();
                    $('#loading').show();
                    setTimeout(function(){shake()},1000);
                },1000);
            }

            flag = 0;

        });

        function mobileClickRight(){

            $(".mobile-pic").addClass("box_rotate");
        }
        function mobileClick(){
            $(".mobile-pic").removeClass("box_rotate");
            $(".mobile-pic").removeClass("box_rotate2");
        }
        function mobileClickLeft(){

            $(".mobile-pic").addClass("box_rotate2");
        }

        var SHAKE_THRESHOLD = 1500;
        var last_update = 0;
        var x=y=z=last_x=last_y=last_z=0;

        function deviceMotionHandler(eventData) {

            var acceleration =eventData.accelerationIncludingGravity;

            var curTime = new Date().getTime();
            if ((curTime - last_update)> 100) {
                var diffTime = curTime -last_update;
                last_update = curTime;
                x = acceleration.x;
                y = acceleration.y;
                z = acceleration.z;
                var speed = Math.abs(x +y + z - last_x - last_y - last_z) / diffTime * 10000;

                if (speed > SHAKE_THRESHOLD) {

                    if(flag == 1){
                        mobileClickRight();
                        setTimeout(function(){mobileClickLeft()},500);
                        setTimeout(function(){
                            mobileClick();
                            $('#loading').show();
                            setTimeout(function(){shake()},1000);
                        },1000);
                    }

                    flag = 0;
                }
                last_x = x;
                last_y = y;
                last_z = z;
            }
        }
        /*后端JS*/

        function shake(){
            if(!$("#uid").val() || !$("#aid").val()){
                alert('请登陆微信后，参加我们的摇一摇活动');
                return false;
            }
            $('#loading').show();
            var _nowTime = new Date().getTime();
            $.get('/lavico/activity/shake_start:shakeit',{
                uid:$("#uid").val(),//微信ID
                aid:$("#aid").val()//摇一摇活动ID
            },function(data){
                $('#loading').hide();
                console.log(data);

                if(data.result == 'win'){
                    var _coupon_no = data.coupon_no;
                    window.location.href="/lavico/activity/shake_end?uid="+$("#uid").val()+"&_id="+$("#aid").val()+"&coupon_no="+_coupon_no;

                }else if(data.result == 'has-no-chance'){

                    alert('今天您的机会用完了，明天再来参加活动吧！');
                    //alert('刚被别人抢光了，好遗憾，下次再参加活动吧！');

                }else if(data.result == 'cannot'){

                    alert('活动到期关闭了，下次再来参加活动吧！');

                }else if(data.result == 'something-error'){

                    alert('活动到期关闭了，下次再来参加活动吧！');

                }else if(data.result == 'unwin'){

                    var _i = data.count;
                    alert('这次没摇到，要不再试一试？还有'+_i+'次机会！');

                }else if((/[\u4e00-\u9fa5]+/).test(data.result)){

                    alert(data.result);

                }else{

                    alert('今天的机会被其他伙伴抢光了，明天再来试一试吧！');
                }

                flag = 1;
            })
        }
    }
}
function write_info(then,info){
    then.res.writeHead(200,{"Content-Type":"application/json"});
    then.res.write(info);
    then.res.end();
    then.terminate();
}
