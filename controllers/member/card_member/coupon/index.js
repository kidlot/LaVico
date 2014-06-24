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
    layout:'lavico/layout',
    view:'lavico/templates/member/card_member/coupon/index.html',
    process:function(seed, nut){
        var member_id;
        var then = this;
        var ineffectiveCoupons = [];//未生效的 01
        var effectiveCoupons = [];//已生效的02
        var usedCoupons = [];//已使用的03
        var overdueCoupons = [];//已到期失效 04
        var errorCoupons = [];//错误
        var couponData;
        var couponArr;

        var wxid = seed.wxid ? seed.wxid : false;//预先定义微信ID

        if(!wxid){

            if(this.req.session.oauthTokenInfo){

                console.log("从SESSION中读取OPENID",this.req.session.oauthTokenInfo.openid)
                wxid = this.req.session.oauthTokenInfo.openid
            }else{

                // 通过oauth获取OPENID
                if(process.wxOauth){

                    if(!seed.code){

                        var url = process.wxOauth.getAuthorizeURL("http://"+this.req.headers.host+this.req.url,"123","snsapi_base")
                        console.log("通过oauth获得CODE的url",url)
                        this.res.writeHeader(302, {'location': url }) ;

                        nut.disable();//不显示模版
                        this.res.end();
                        this.terminate();

                    }else{

                        process.wxOauth.getAccessToken(seed.code,this.hold(function(err,doc){

                            if(!err){
                                var openid = doc.openid
                                wxid = openid || undefined;
                                console.log("通过oauth获得信息",doc)
                                this.req.session.oauthTokenInfo = doc;
                            }
                        }))
                    }

                }
            }
        }


        this.step(function(){
            if(!wxid){
                nut.disable();//不显示模版
                this.res.writeHead(200, { 'Content-Type': 'application/json' });
                this.res.write('{"error":"wxid_is_empty"}');
                this.res.end();
                this.terminate();
            }
        });

        this.step(function(){

            nut.model.wxid = wxid;
            helper.db.coll('welab/customers').findOne({wechatid:wxid},this.hold(function(err, doc){

                if(!doc){

                    nut.disable();//不显示模版
                    this.res.writeHead(200, { 'Content-Type': 'application/json' });
                    this.res.write('{"error":"wxid_no_bind_to_welab"}');
                    this.res.end();
                    this.terminate();

                }else{

                    if(doc && doc.HaiLanMemberInfo && doc.HaiLanMemberInfo.memberID && doc.HaiLanMemberInfo.action=='bind'){
                        member_id =  doc.HaiLanMemberInfo.memberID;
                        nut.model.error = "null" ;
                    }else{
                        member_id = "undefined";
                        nut.model.error = "member_id_undefined" ;
                    }

                }


            }));

        });

        this.step(function(){

            if(member_id == "undefined"){

                //缺少微信ID参数，强制中断

            }else{

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


                    var requestData02 = {
                        'memberId' : member_id,
                        'perPage':0,
                        'pageNum':0,
                        'status':'02'//已生效
                    };
                    middleware.request( "Coupon/GetCoupons", requestData02,this.hold(function(err,doc){

                        couponData = JSON.parse(doc);
                        nut.model.effectiveCouponsLength = couponData.total;
                        //记录用户动作
                    }));

                    var requestData03 = {
                        'memberId' : member_id,
                        'perPage':0,
                        'pageNum':0,
                        'status':'03'//已使用
                    };
                    middleware.request( "Coupon/GetCoupons", requestData03,this.hold(function(err,doc){

                        couponData = JSON.parse(doc);
                        nut.model.usedCouponsLength = couponData.total;
                        //记录用户动作
                    }));

                    var requestData04 = {
                        'memberId' : member_id,
                        'perPage':0,
                        'pageNum':0,
                        'status':'04'//已过期
                    };
                    middleware.request( "Coupon/GetCoupons", requestData04,this.hold(function(err,doc){

                        couponData = JSON.parse(doc);
                        nut.model.overdueCouponsLength = couponData.total;
                        //记录用户动作
                    }));


                });
                this.step(function(){
                    /*
                    var requestData01 = {
                        'memberId' : member_id,
                        'perPage':10000,
                        'pageNum':1,
                        'status':'01'//未生效
                    };

                    middleware.request( "Coupon/GetCoupons", requestData01,this.hold(function(err,doc){

                        couponData = JSON.parse(doc);

                        couponArr  = couponData.list;
                        //nut.model.ineffectiveCouponsLength = couponData.total;

                        helper.db.coll("welab/feeds").insert(
                            {
                                'createTime':new Date().getTime(),
                                'wxid':seed.wxid,
                                'action':"check_coupon",
                                'request':requestData01,
                                'reponse':couponData
                            },this.hold( function(err, doc){
                                err&console.log(doc);
                            })
                        );
                        //记录用户动作
                    }));
                    */

                    var requestData02 = {
                        'memberId' : member_id,
                        'perPage':10000,
                        'pageNum':1,
                        'status':'02'//已生效
                    };

                    middleware.request( "Coupon/GetCoupons", requestData02,this.hold(function(err,doc){

                        couponData = JSON.parse(doc);

                        couponArr = couponData.list;
                        //nut.model.effectiveCouponsLength = couponData.total;

                        helper.db.coll("welab/feeds").insert(
                            {
                                'createTime':new Date().getTime(),
                                'wxid':seed.wxid,
                                'action':"check_coupon",
                                'request':requestData02,
                                'reponse':couponData
                            },this.hold( function(err, doc){
                                err&console.log(doc);
                            })
                        );
                        //记录用户动作
                    }));

                    var requestData03 = {
                        'memberId' : member_id,
                        'perPage':10000,
                        'pageNum':1,
                        'status':'03'//已使用

                    };

                    middleware.request( "Coupon/GetCoupons", requestData03,this.hold(function(err,doc){

                        couponData = JSON.parse(doc);
                        couponArr = couponArr.concat(couponData.list);
                        //nut.model.overdueCouponsLength = couponData.total;

                        helper.db.coll("welab/feeds").insert(
                            {
                                'createTime':new Date().getTime(),
                                'wxid':seed.wxid,
                                'action':"check_coupon",
                                'request':requestData03,
                                'reponse':couponData
                            },this.hold( function(err, doc){
                                err&console.log(doc);
                            })
                        );
                        //记录用户动作
                    }));

                    var requestData04 = {
                        'memberId' : member_id,
                        'perPage':10000,
                        'pageNum':1,
                        'status':'04'//已到期失效

                    };

                    middleware.request( "Coupon/GetCoupons", requestData04,this.hold(function(err,doc){

                        couponData = JSON.parse(doc);
                        couponArr = couponArr.concat(couponData.list);

                        helper.db.coll("welab/feeds").insert(
                            {
                                'createTime':new Date().getTime(),
                                'wxid':seed.wxid,
                                'action':"check_coupon",
                                'request':requestData04,
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
                    var _coupons = couponArr;

                    for(var _i=0;_i<_coupons.length;_i++){

                        var _PROMOTION_CODE = _coupons[_i].PROMOTION_CODE;

                        (function(_i){
                            helper.db.coll("lavico/activity").findOne({aid: _PROMOTION_CODE},
                                then.hold(function (err, doc) {

                                    if(doc&&doc.pic){
                                        var _PIC = doc.pic;
                                    }else{
                                        var _PIC = "/lavico/public/images/coupons.jpg";
                                    }

                                    if(doc&&doc.promotion_name){
                                        var _PROMOTION_NAME = doc.promotion_name;
                                    }else{
                                        var _PROMOTION_NAME = "";
                                    }
                                    couponArr[_i].PIC = _PIC;

                                    couponArr[_i].COUPON_NAME = _PROMOTION_NAME;//活动和优惠券一一对应
                                }));
                        })(_i);

                    }

                });

                this.step(function(){

                    var coupons = [];
                    var _coupons = couponArr;
                    console.log(couponArr);
                    /*
                     优惠券状态 01: 未生效  02: 已生效  03: 已使用  04: 已到期失效,默认 02
                     */
                    //_coupons.sort(function(a,b){return a['CREAT_DATE']<b['CREAT_DATE']?1:-1});

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
                        var _CREAT_DATE  = formatTime(_coupons[_i].CREAT_DATE);
                        var _BIND_DATE  = formatDate(_coupons[_i].BIND_DATE);
                        var _USED_DATE = formatTime(_coupons[_i].USED_DATE);
                        var _PROMOTION_CODE = _coupons[_i].PROMOTION_CODE;
                        var _COUPON_NO = _coupons[_i].COUPON_NO;
                        var _COUPON_QTY = _coupons[_i].COUPON_QTY;
                        var _COUPON_TYPE = _coupons[_i].BASE_CODE_NAME;
                        var _COUPON_NAME = _coupons[_i].COUPON_NAME;

                        if(_coupons[_i].COUPON_QTY){
                            _coupons[_i].COUPON_QTY = _coupons[_i].COUPON_QTY +'元';
                        }else{
                            _coupons[_i].COUPON_QTY = '';
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

                            //ineffectiveCoupons.push(coupons[_i]);

                        }else if(coupons[_i].COUPON_STATUS == '02'){

                            effectiveCoupons.push(coupons[_i]);

                        }else if(coupons[_i].COUPON_STATUS == '03'){

                            usedCoupons.push(coupons[_i]);

                        }else if(coupons[_i].COUPON_STATUS == '04'){

                            overdueCoupons.push(coupons[_i]);
                            console.log('~~~~~~~~~~~~~~~~~~~~~~`');
                            console.log(overdueCoupons);

                        }else{
                            errorCoupons.push(coupons[_i]);
                        }
                    }

                    //可使用
                    nut.model.effectiveCoupons = effectiveCoupons;

                    //已使用
                    nut.model.usedCoupons = usedCoupons;

                    //已过期
                    nut.model.overdueCoupons = overdueCoupons;

                });
            }
        });


    },
    viewIn:function(){

        $('#loading').hide();//隐藏加载框

        var wxid = $('#wxid').val();
        var error = $("#error").val();
        if(error!='null'){
            window.popupStyle2.on("您还不是LaVico的会员，请先注册会员",function(event){
                window.location.href="/lavico/member/card_blank/register?wxid="+wxid;
            });
        }
        $('.couponBtn').each(function(){
            $(this).bind('click',function(){
                $('.couponBtn').removeClass('on');
                $(this).addClass('on');

                var _id = $(this).attr('id');

                $('.pre-box').hide();
                $('#'+_id+'Content').show();
            });
        });

        /*掩藏分享按钮*/
        window.hideShareButtion.on();
        /*优惠券分页*/
        /*已过期04-可使用02-已使用03*/
        var pageNum04 = 1;
        var perPage04 = 5;

        var pageNum02 = 1;
        var perPage02 = 5;

        var pageNum03 = 1;
        var perPage03 = 5;
        var type = '02';
        window.getUserCoupons = function(pageNum,perPage,type){
            $.ajax({
                    url:'/lavico/member/card_member/coupon/index:getUserCoupons',
                    type:'GET',
                    dataType:'json',
                    data:{
                        'wxid':$('#wxid').val(),
                        'pageNum':pageNum,
                        'perPage':perPage
                    },
                    success:function(data){
                        console.log(data);

                    }
                }
            );
        };
        window.getUserCoupons();

    },
    action:{
        getUserCoupons:function(seed,nut){

            var status = seed.status||'02';
            var pageNum = seed.pageNum || 1;
            var perPage = seed.perPage || 5;
            var wxid = seed.wxid;
            var couponArr;
            var error;
            var success = 'false';
            var couponData;
            var member_id;
            var requestData = {};

            this.step(function(){
                helper.db.coll('welab/customers').findOne({wechatid:wxid},this.hold(function(err, doc){

                    if (doc && doc.HaiLanMemberInfo && doc.HaiLanMemberInfo.memberID && doc.HaiLanMemberInfo.action == 'bind') {
                        member_id = doc.HaiLanMemberInfo.memberID;
                        success = 'true';
                        error = "null";
                    } else {
                        error = "member_id_undefined";
                        success = 'false';
                    }

                }));
            });

            this.step(function(){
                var requestData = {
                    'memberId':member_id,
                    'perPage':perPage,
                    'pageNum':pageNum,
                    'status':status
                };
                middleware.request( "Coupon/GetCoupons", requestData,this.hold(function(err,doc){

                    couponData = JSON.parse(doc);
                    couponArr = couponData.list;
                    couponArr = JSON.stringify(couponArr);
                    if(couponArr){
                        success = 'true';
                    }else{
                        success = 'false';
                        error = 'coupon_is_null';
                    }
                    console.log(couponArr);

                }));
            });

            this.step(function(){
                if(success == 'true'){
                    this.res.writeHead(200, { 'Content-Type': 'application/json' });
                    this.res.write('{"success":true,"info":'+couponArr+'}');
                    this.res.end();
                }else{
                    this.res.writeHead(200, { 'Content-Type': 'application/json' });
                    this.res.write('{"success":false,"info":"'+error+'"}');
                    this.res.end();
                }
            });
            
        }
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