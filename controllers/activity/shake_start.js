/**
 * Created by David Xu on 5/9/14.
 */
var middleware = require('../../lib/middleware.js');
module.exports = {
    layout: "lavico/layout",
    view: "lavico/templates/activity/shake_start.html",
    process:function(seed,nut){

        /*MemberID会员判断*/

        var wxid = seed.uid ? seed.uid : 'undefined';//uid是用户的wechatid
        var aid = seed.aid ? seed.aid : 'undefined';//摇一摇活动ID
        var shakeActivity;//摇一摇活动信息
        var shakeActivityName;//摇一摇活动的名称

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
            console.log(shakeActivity);
            var _points = shakeActivity ? shakeActivity.points : 0;//活动消耗积分
            nut.model.points = _points;
        });

    },
    actions:{
        init:{
            //初始化
            process: function(seed,nut)
            {
                nut.disabled = true ;
                var then = this;
                if(!seed.uid || !seed.aid){
                    write_info(then,'{"result":"miss"}');
                    return;
                }
                var shake;
                var costPerShake;//每次摇一摇消耗积分
                var memberPoints;//用户积分
                var memberId;//用户memberID
                var wxid = seed.uid;//用户微信ID
                var shakeActivityName;//摇一摇活动名称

                var countUserByPoints;//根据积分计算多少次数
                var returnCount;//根据系统后台设置，返回多少次机会
                var lottery_count;//保存后台设置，用户还可以玩多少次机会（剩余的机会）

                var lottery_cycle;//抽奖频率



                this.step(function(){

                    helper.db.coll('lavico/shake').findOne({_id:helper.db.id(seed.aid),switcher:'on',startDate:{$lte:new Date().getTime()},endDate:{$gte:new Date().getTime()}},this.hold(function(err,doc){
                        shake = doc;
                        costPerShake = shake ? shake.points : 0;//每次摇一摇消耗积分
                        shakeActivityName = shake ? shake.name :'';
                        console.log('~~~~~~~~~~~~~~~~~');
                        console.log(doc);
                        console.log('~~~~~~~~~~~~~~~~~');
                    }));
                });

                this.step(function(){
                    if(!shake){
                            write_info(then,'{"result":"activity_is_over"}');
                    }
                });

                this.step(function(){
                    /*判断用户积分是否足够*/
                    console.log("costPerShake:"+costPerShake);
                    if(costPerShake >=  0){

                        helper.db.coll('welab/customers').findOne({wechatid:wxid},then.hold(function(err,doc){

                            console.log(doc);

                            if(doc&&doc.HaiLanMemberInfo&&doc.HaiLanMemberInfo.action=='bind'){
                                memberId = doc.HaiLanMemberInfo.memberID;
                            }else{
                                memberId = "undefined";
                            }
                            console.log('****************************************');
                            console.log("memberId:"+memberId);
                            console.log('****************************************');

                            if(memberId == "undefined"){
                                write_info(then,'{"result":"something-error"}');
                            }
                        }));
                    }

                });

                this.step(function(){
                    if(costPerShake >  0){

                        middleware.request('Point/'+memberId,{
                        },then.hold(function(err,doc){
                            doc = JSON.parse(doc);
                            if(err){
                                console.log(err);
                                write_info(then,'{"result":"something-error"}');

                            }else{

                                if(doc.error){
                                    console.log(doc.error);
                                    write_info(then,'{"result":"something-error"}');
                                }else{
                                    memberPoints = doc.point;
                                    countUserByPoints = Math.floor(memberPoints/costPerShake);

                                    console.log(doc);
                                    console.log("memberPoints:"+memberPoints);
                                    console.log("countUserByPoints:"+countUserByPoints);

                                }
                            }

                        }));

                    }
                });

                this.step(function(){
                    if(costPerShake >  0){
                        if(memberPoints < costPerShake){
                            write_info(then,'{"result":"your-points-not-enough"}');
                        }
                    }
                });
                var count=0;
                this.step(function(){
                    var start_time;
                    var now_timestamp = new Date().getTime();
                    lottery_cycle = shake.lottery_cycle;//抽奖频率
                    if(shake.lottery_cycle == '1'){ // 自然天
                        start_time = now_timestamp - ( now_timestamp % 86400000 );
                    }else if(shake.lottery_cycle == '2'){// 自然周
                        if(new Date().getDay() > 0){
                            /*
                            * var weekday=new Array(7)
                             weekday[0]="Sunday"
                             weekday[1]="Monday"
                             weekday[2]="Tuesday"
                             weekday[3]="Wednesday"
                             weekday[4]="Thursday"
                             weekday[5]="Friday"
                             weekday[6]="Saturday"
                           */
                            start_time = now_timestamp -(86400000*(new Date().getDay()) -1) - ( now_timestamp % 86400000 );
                        }else{
                            start_time = now_timestamp -(86400000*(new Date().getDay()) -6) - ( now_timestamp % 86400000 );
                        }
                    }else if(shake.lottery_cycle == '3'){//自然月
                        start_time = now_timestamp -(86400000*(new Date().getDate())-1) - ( now_timestamp % 86400000 );
                    }else if(shake.lottery_cycle == '100'){//永久
                        start_time = 0;
                    }else{
                        write_info(then,'{"result":"something-error"}');
                    }
                    helper.db.coll('lavico/shake/logs').count({aid:seed.aid,memberID:memberId,createDate:{$gte:start_time}},this.hold(function(err,doc){
                        count = doc;//已经摇一摇次数
                        console.log('+++++++++++++++++');
                        console.log('now'+seed.aid+'sum:'+doc);
                        console.log('+++++++++++++++++');
                    }));
                })

                this.step(function(){
                    if(parseInt(shake.lottery_count)==0){
                        //不限制次数
                        lottery_count = 0;

                    }else{
                        lottery_count = parseInt(shake.lottery_count);
                        returnCount = shake.lottery_count - count;//shake.lottery_count 允许的摇一摇次数
                        console.log('now '+seed.aid+' can:'+shake.lottery_count);
                        console.log('now '+seed.aid+' go on getting:'+returnCount);
                        console.log('has-count:'+count);
                        console.log('system-count:'+shake.lottery_count);
                        if(count >= shake.lottery_count){

                            write_info(then,'{"result":"has-no-chance","lottery_cycle":"'+lottery_cycle+'"}');
                        }
                    }

                })

                this.step(function(){
                    var activity = {};

                    var _points = 0 - parseInt(shake.points);//每次摇一摇，消耗积分
                    if(shake.points > 0){
                        if(countUserByPoints>returnCount){
                            var _count = returnCount;//系统设置允许多少次
                        }else{
                            var _count = countUserByPoints;//根据用户积分设置允许多少次
                        }
                    }else{
                        var _count = returnCount;//系统设置允许多少次
                    }

                    console.log("countUserByPoints:"+countUserByPoints);
                    console.log("returnCount:"+returnCount);
                    console.log("count:"+_count);

                    if(lottery_count == 0){
                        //不限制次数
                        write_info(then,'{"result":"unwin","limit":"no","lottery_cycle":"'+lottery_cycle+'","points":"'+shake.points+'","count":"'+lottery_count+'"}');
                    }else{
                        write_info(then,'{"result":"unwin","limit":"yes","lottery_cycle":"'+lottery_cycle+'","points":"'+shake.points+'","count":"'+_count+'"}');
                    }

                })
            }
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
                var costPerShake;//每次摇一摇消耗积分
                var memberPoints;//用户积分
                var memberId;//用户memberID
                var wxid = seed.uid;//用户微信ID
                var shakeActivityName;//摇一摇活动名称
                var lottery_count;//保存后台设置，限制用户玩多少次机会


                var countUserByPoints;//根据积分计算多少次数
                var returnCount;//根据系统后台设置，返回多少次机会
                var PROMOTION_CODE;

                var lottery_cycle;
                this.step(function(){
                    helper.db.coll('lavico/shake').findOne({_id:helper.db.id(seed.aid),switcher:'on',startDate:{$lte:new Date().getTime()},endDate:{$gte:new Date().getTime()}},this.hold(function(err,doc){
                        shake = doc;
                        costPerShake = shake.points;//每次摇一摇消耗积分
                        shakeActivityName = shake.name;
                        console.log('~~~~~~~~~~~~~~~~~');
                        console.log(doc);
                        console.log('~~~~~~~~~~~~~~~~~');
                    }));
                });

                this.step(function(){
                    if(!shake){
                        write_info(then,'{"result":"activity_is_over"}');
                    }
                });

                this.step(function(){
                    /*判断用户积分是否足够*/
                    console.log("costPerShake:"+costPerShake);
                    if(costPerShake >=  0){
                        helper.db.coll('welab/customers').findOne({wechatid:wxid},then.hold(function(err,doc){

                            console.log(doc);

                            if(doc&&doc.HaiLanMemberInfo&&doc.HaiLanMemberInfo.action=='bind'){
                               memberId = doc.HaiLanMemberInfo.memberID;
                            }else{
                               memberId = "undefined";
                            }
                            console.log("memberId:"+memberId);

                            if(memberId == "undefined"){
                                write_info(then,'{"result":"something-error"}');
                            }
                        }));

                    }
                });

                this.step(function(){
                    if(costPerShake >  0){

                        middleware.request('Point/'+memberId,{
                        },then.hold(function(err,doc){
                            doc = JSON.parse(doc);
                            if(err){
                                console.log(err);
                                write_info(then,'{"result":"something-error"}');

                            }else{

                                if(doc.error){
                                    console.log(doc.error);
                                    write_info(then,'{"result":"something-error"}');
                                }else{
                                    memberPoints = doc.point;
                                    countUserByPoints = Math.floor(memberPoints/costPerShake);

                                    console.log(doc);
                                    console.log("memberPoints:"+memberPoints);

                                }
                            }

                        }));

                    }
                });

                this.step(function(){
                    if(costPerShake >  0){
                        if(memberPoints < costPerShake){
                            write_info(then,'{"result":"your-points-not-enough"}');
                        }
                    }
                });
                var count=0;
                this.step(function(){
                    var start_time;
                    lottery_cycle = shake.lottery_cycle;//抽奖频率

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
                    helper.db.coll('lavico/shake/logs').count({aid:seed.aid,memberID:memberId,createDate:{$gte:start_time}},this.hold(function(err,doc){
                        //aid:活动编号
                        //memberID:lavico会员编号
                        count = doc;//已经摇一摇次数
                        console.log('+++++++++++++++++');
                        console.log('now'+seed.aid+'sum:'+doc);
                        console.log('+++++++++++++++++');
                    }));
                })
                this.step(function(){
                    if(parseInt(shake.lottery_count)==0){
                        //不限制次数
                        lottery_count = 0;

                    }else{
                        lottery_count = parseInt(shake.lottery_count);
                        returnCount = shake.lottery_count - count;//shake.lottery_count 允许的摇一摇次数
                        console.log('now '+seed.aid+' can:'+shake.lottery_count);
                        console.log('now '+seed.aid+' go on getting:'+returnCount);
                        console.log('has-count:'+count);
                        console.log('system-count:'+shake.lottery_count);
                        if(count >= shake.lottery_count){

                            write_info(then,'{"result":"has-no-chance","lottery_cycle":"'+lottery_cycle+'"}');
                        }
                    }

                })

                this.step(function(){
                    var activity = {};

                    var _points = 0 - parseInt(shake.points);//每次摇一摇，消耗积分

                    activity.aid = seed.aid;//摇一摇活动ID，也就是_id
                    activity.uid = seed.uid;
                    activity.points = _points;//每次摇一摇，所需要的积分多少
                    activity.memberID = memberId;//用户
                    activity.createDate = new Date().getTime();
                    activity.memo = shakeActivityName;
                    console.log(activity.memo);
                    console.log(shake);
                    console.log(shake.lottery);

                    var _random = Math.floor(Math.random()*100+1);//产生一个随机数字，100以内的数字
                    var _flag = 0;//0表示不中奖，1表示中奖
                    var _chance = 0;
                    var _aid;
                    var _lotteryInfo;

                    /*根据随机数判断是否中奖*/
                    console.log('++++++++++++++');
                    console.log(shake.lottery)
                    console.log('++++++++++++++');

                    for(var _i=0;_i<shake.lottery.length;_i++){

                        if(_i==0){
                            _chance = parseInt(shake.lottery[0].lottery_chance);
                        }else{
                            _chance = _chance + parseInt(shake.lottery[_i].lottery_chance);
                        }
                        console.log(_chance)
                        if(_random <= _chance){
                            PROMOTION_CODE = shake.lottery[_i].PROMOTION_CODE;
                            _lotteryInfo = shake.lottery[_i];
                            _flag = 1;
                            console.log('--------------');
                            console.log(_chance);
                            console.log('--------------');
                            break;
                        }

                    }
                    console.log('random:'+_random);


                    if(_flag == 1){

                        activity.promotion_code = _lotteryInfo.PROMOTION_CODE;
                        activity.promotion_name = _lotteryInfo.PROMOTION_NAME;
                        activity.promotion_desc = _lotteryInfo.PROMOTION_DESC;
                        activity.promotion_qty = _lotteryInfo.PROMOTION_QTY || null;
                        activity.display_name = _lotteryInfo.display_name;
                        activity.lottery_chance = _lotteryInfo.lottery_chance;

                        console.log("摇一摇领取优惠券");
                        console.log("PROMOTION_CODE:"+PROMOTION_CODE);
                        middleware.request('Coupon/FetchCoupon',{
                            openid:seed.uid,
                            PROMOTION_CODE:PROMOTION_CODE, //海澜CRM 活动代码，由 Promotions 接口返回
                            point:0,//每次摇一摇，消耗积分
                            otherPromId:seed.aid, //微信活动识别ID
                            memo:activity.memo
                        },this.hold(function(err,doc){
                            //console.log("摇一摇领取优惠券");
                            err&&console.log(doc);
                            doc = JSON.parse(doc);
                            console.log(doc);
                            if(doc.success == true) {
                                //减去积分
                                //当消耗积分大于零的时候，才消耗积分
                                if(costPerShake > 0){
                                    middleware.request('Point/Change', {
                                        memberId: memberId,
                                        qty: _points,//每次摇一摇，消耗积分
                                        memo: shakeActivityName
                                    }, then.hold(function (err, doc) {
                                        console.log(doc);
                                    }));
                                }
                                activity.coupon_no = doc.coupon_no;//优惠券号码

                                helper.db.coll('welab/customers').update({wechatid: seed.uid}, {$addToSet: {shake: activity}}, function (err, doc) {
                                    err && console.log(doc);
                                });

                                helper.db.coll("lavico/shake/logs").insert(activity, function (err, doc) {
                                    err && console.log(doc);
                                });
                                write_info(then, '{"result":"win","PROMOTION_CODE":"' + PROMOTION_CODE + '","coupon_no":"' + doc.coupon_no + '"}');
                            }else{

                                if(doc.error=='此活动优惠券已发完！'){

                                    /*摇一摇-活动券发放完毕处理-start*/

                                     console.log("shake fail");
                                     helper.db.coll('lavico/shake/logs').insert(activity,function(err,doc){
                                     err&&console.log(doc);
                                     });
                                     if(costPerShake > 0){
                                     middleware.request('Point/Change',{
                                     memberId:memberId,
                                     qty:_points,//每次摇一摇，消耗积分
                                     memo:shakeActivityName
                                     },then.hold(function(err,doc){
                                     console.log(doc);
                                     }));
                                     }

                                     if(costPerShake > 0){
                                     if(countUserByPoints>returnCount){
                                     var _count = returnCount;//系统设置允许多少次
                                     }else{
                                     var _count = countUserByPoints;//根据用户积分设置允许多少次
                                     }
                                     }else{
                                     var _count = returnCount;//系统设置允许多少次
                                     }

                                     _count = _count - 1;

                                     if(lottery_count == 0){
                                     //不限制次数
                                    write_info(then,'{"result":"unwin","limit":"no","lottery_cycle":"'+lottery_cycle+'","points":"'+shake.points+'","count":"'+lottery_count+'"}');

                                     }else{
                                    write_info(then,'{"result":"unwin","limit":"yes","lottery_cycle":"'+lottery_cycle+'","points":"'+shake.points+'","count":"'+_count+'"}');
                                     }
                                     /*摇一摇-活动券发放完毕处理-end*/
                                }else if(doc.error=='找不到对应的人员，请检查！'){
                                    write_info(then,'{"result":"'+'lavico_no_found_wxid'+'"}');
                                }else{
                                    write_info(then,'{"result":"'+doc.error+'"}');
                                }


                            }

                        }));

                    }else{

                        /*摇一摇失败处理*/
                        console.log("shake fail");
                        helper.db.coll('lavico/shake/logs').insert(activity,function(err,doc){
                            err&&console.log(doc);
                        });
                        if(costPerShake > 0){
                            middleware.request('Point/Change',{
                                memberId:memberId,
                                qty:_points,//每次摇一摇，消耗积分
                                memo:shakeActivityName
                            },then.hold(function(err,doc){
                                console.log(doc);
                            }));
                        }

                        if(costPerShake > 0){
                            if(countUserByPoints>returnCount){
                                var _count = returnCount;//系统设置允许多少次
                            }else{
                                var _count = countUserByPoints;//根据用户积分设置允许多少次
                            }
                        }else{
                            var _count = returnCount;//系统设置允许多少次
                        }

                        _count = _count - 1;

                        if(lottery_count == 0){
                            //不限制次数
                            write_info(then,'{"result":"unwin","limit":"no","lottery_cycle":"'+lottery_cycle+'","points":"'+shake.points+'","count":"'+lottery_count+'"}');

                        }else{
                            write_info(then,'{"result":"unwin","limit":"yes","lottery_cycle":"'+lottery_cycle+'","points":"'+shake.points+'","count":"'+_count+'"}');
                        }


                    }
                })
            }
        }
    },
    viewIn:function(){

        /*前端设计JS*/
        $('#loading').hide();//隐藏加载框

        /*掩藏分享按钮*/
        window.hideShareButtion.on();

        var flag = 0;//默认不可摇一摇

        var init = function(){

            $.get('/lavico/activity/shake_start:init',{
                uid:$("#uid").val(),//微信ID
                aid:$("#aid").val()//摇一摇活动ID,也就是_id
            },function(data){
                $('#loading').hide();
                console.log(data);

                if(data.result == 'has-no-chance'){
                    //您的机会已用完，下次再来试试吧
                    //alert('刚被别人抢光了，好遗憾，下次再参加活动吧！');

                    if(data.lottery_cycle == 1){
                        window.popupStyle2.on('今天您的机会没有了，明天再来试一试吧！',function(event){
                            flag = 1;
                        });
                    }else if(data.lottery_cycle == 2){
                        window.popupStyle2.on('最近7天您的的机会用完了，下次再来吧！',function(event){
                            flag = 1;
                        });
                    }else if(data.lottery_cycle == 3){
                        window.popupStyle2.on('最近30天您的的机会用完了，下次再来吧！',function(event){
                            flag = 1;
                        });
                    }else if(data.lottery_cycle == 100){
                        window.popupStyle2.on('您的机会用完了，下次活动再来吧！',function(event){
                            flag = 1;
                        });
                    }else{
                        window.popupStyle2.on('今天您的机会没有了，明天再来试一试吧！',function(event){
                            flag = 1;
                        });
                    }

                }else if(data.result == 'activity_is_over'){

                    window.popupStyle2.on('很抱歉，活动已结束',function(event){
                        flag = 1;
                    });

                }else if(data.result == 'something-error'){

                    window.popupStyle2.on('很抱歉，活动已结束',function(event){
                        flag = 1;
                    });

                }else if(data.result == 'unwin'){
                    //每次摇一摇将消耗20积分，你当前还有10次机会
                    var _i = data.count;//你当前还有次机会的次数
                    var _points = parseInt(data.points);//每次摇一摇将消耗的积分
                    var _limit = data.limit;
                    if(_limit == 'yes'){
                        if(_points == 0){
                            window.popupStyle2.on('您当前还有'+_i+'次机会',function(event){
                                flag = 1;
                            });
                        }else{
                            window.popupStyle2.on('每次摇一摇将消耗'+_points+'积分，您当前还有'+_i+'次机会',function(event){
                                flag = 1;
                            });
                        }
                    }else{
                        if(_points == 0){
                            flag = 1;
                        }else{
                            window.popupStyle2.on('每次摇一摇将消耗'+_points+'积分',function(event){
                                flag = 1;
                            });
                        }
                    }

                }else if((/[\u4e00-\u9fa5]+/).test(data.result)){

                    window.popupStyle2.on(data.result,function(event){
                        flag = 1;
                    });

                }else if(data.result == 'your-points-not-enough'){

                    window.popupStyle2.on('您的积分不够了，快去朗维高门店消费或者参加抢积分活动吧！',function(event){
                        flag = 1;
                    });

                }else{

                    window.popupStyle2.on('很抱歉，活动已结束',function(event){
                        flag = 1;
                    });

                }
            })
        }


        init();

        if (window.DeviceMotionEvent) {
            window.addEventListener('devicemotion',deviceMotionHandler, false);
        }else{
            console.log('您的手机没法摇？那就直接点击下面按钮吧！');
            window.popupStyle2.on('您的手机没法摇？那就直接点击下面按钮吧！',function(event){});
        }
        var timer;
        var timerShake;

        var shakeIt = function(){

                mobileClickRight();

                setTimeout(function(){
                    mobileClick();
                },50);

                setTimeout(function(){mobileClickLeft()},100);

                setTimeout(function(){
                    mobileClick();
                },150);

        }


        function mobileClickRight(){

            $(".mobile-pic").addClass("box_rotate");
        }

        function mobileClickLeft(){

            $(".mobile-pic").addClass("box_rotate2");
        }

        function mobileClick(){
            $(".mobile-pic").removeClass("box_rotate");
            $(".mobile-pic").removeClass("box_rotate2");
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

                        timer = setInterval(function(){shakeIt()},200);//开始摇动
                        shake();

                    }
                    flag = 0;
                }


                last_x = x;
                last_y = y;
                last_z = z;
            }
        }

        $('.mobile-btn').click(function(){
            if(flag == 1){
                timer = setInterval(function(){shakeIt()},200);//开始摇动
                shake();
            }
            flag = 0;
        });
        /*后端JS*/

        function shake(){


            if(!$("#uid").val() || !$("#aid").val()){
                //alert('请登陆微信后，参加我们的摇一摇活动');
                window.popupStyle2.on('请登陆微信后，参加我们的摇一摇活动',function(event){});
                return false;
            }
            $('#loading').show();

            var _nowTime = new Date().getTime();
            $.get('/lavico/activity/shake_start:shakeit',{
                uid:$("#uid").val(),//微信ID
                aid:$("#aid").val()//摇一摇活动ID
            },function(data){

                timerShake = setTimeout(function(){

                    $('#loading').hide();
                    clearInterval(timer);
                    console.log(data);

                    if(data.result == 'win'){
                        var _coupon_no = data.coupon_no;
                        var _PROMOTION_CODE = data.PROMOTION_CODE;
                        window.location.href="/lavico/activity/shake_end?uid="+$("#uid").val()+"&aid="+$("#aid").val()+"&activity="+_PROMOTION_CODE+"&coupon_no="+data.coupon_no;

                    }else if(data.result == 'has-no-chance'){

                        //alert('刚被别人抢光了，好遗憾，下次再参加活动吧！');
                        if(data.lottery_cycle == 1){
                            window.popupStyle2.on('今天您的机会没有了，明天再来试一试吧！',function(event){
                                flag = 1;
                            });
                        }else if(data.lottery_cycle == 2){
                            window.popupStyle2.on('最近7天您的的机会用完了，下次再来吧！',function(event){
                                flag = 1;
                            });
                        }else if(data.lottery_cycle == 3){
                            window.popupStyle2.on('最近30天您的的机会用完了，下次再来吧！',function(event){
                                flag = 1;
                            });
                        }else if(data.lottery_cycle == 100){
                            window.popupStyle2.on('您的机会用完了，下次活动再来吧！',function(event){
                                flag = 1;
                            });
                        }else{
                            window.popupStyle2.on('今天您的机会没有了，明天再来试一试吧！',function(event){
                                flag = 1;
                            });
                        }

                    }else if(data.result == 'activity_is_over'){

                        window.popupStyle2.on('很抱歉，活动已结束',function(event){
                            flag = 1;
                        });

                    }else if(data.result == 'something-error'){

                        window.popupStyle2.on('很抱歉，活动已结束',function(event){
                            flag = 1;
                        });

                    }else if(data.result == 'unwin'){

                        var _limit = data.limit;

                        if(_limit == 'yes'){
                            //每次摇一摇将消耗20积分，你当前还有10次机会
                            var _i = data.count;//你当前还有次机会的次数
                            if(_i > 0){
                                var _points = parseInt(data.points);//每次摇一摇将消耗的积分
                                if(_points == 0){
                                    //本次活动您共有5次抽奖机会，已使用2次
                                    window.popupStyle2.on('这次没摇到，要不再试一试？还有'+_i+'次机会',function(event){
                                        flag = 1;
                                    });
                                }else{
                                    //本次活动您共有5次抽奖机会，已使用2次
                                    window.popupStyle2.on('这次没摇到，要不再试一试？还有'+_i+'次机会',function(event){
                                        flag = 1;
                                    });
                                }
                            }else{
//                                window.popupStyle2.on('这次没摇到，今天没机会了，明天再来试一试吧！',function(event){
//                                    flag = 1;
//                                });
                                if(data.lottery_cycle == 1){
                                    window.popupStyle2.on('今天您的机会没有了，明天再来试一试吧！',function(event){
                                        flag = 1;
                                    });
                                }else if(data.lottery_cycle == 2){
//                                    window.popupStyle2.on('本周您的的机会用完了，下次再来吧！',function(event){
//                                        flag = 1;
//                                    });
                                    window.popupStyle2.on('最近7天您的的机会用完了，下次再来吧！',function(event){
                                        flag = 1;
                                    });
                                }else if(data.lottery_cycle == 3){
                                    window.popupStyle2.on('最近30天您的的机会用完了，下次再来吧！',function(event){
                                        flag = 1;
                                    });
                                }else if(data.lottery_cycle == 100){
                                    window.popupStyle2.on('您的机会用完了，下次活动再来吧！',function(event){
                                        flag = 1;
                                    });
                                }else{
                                    window.popupStyle2.on('今天您的机会没有了，明天再来试一试吧！',function(event){
                                        flag = 1;
                                    });
                                }

                            }

                        }else{
                            window.popupStyle2.on('这次没摇到，要不再试一试？',function(event){
                                flag = 1;
                            });
                        }


                    }else if((/[\u4e00-\u9fa5]+/).test(data.result)){

                        window.popupStyle2.on(data.result,function(event){
                            flag = 1;
                        });

                    }else if(data.result == 'your-points-not-enough'){

                        window.popupStyle2.on('您的积分不够了，快去朗维高门店消费或者参加抢积分活动吧！',function(event){
                            flag = 1;
                        });
                    }else if(data.result == 'lavico_no_found_wxid'){

                        window.popupStyle2.on('您的当前微信帐号可能未注册我们的会员，如需帮助，请拨打400-100-8866联系',function(event){
                            flag = 1;
                        });

                    }else{

                        window.popupStyle2.on('很抱歉，活动已结束',function(event){
                            flag = 1;
                        });

                    }


                },0);



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
