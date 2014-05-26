/**
 * Created by David Xu on 3/12/14.
 * 会员绑定
 */

var middleware = require('lavico/lib/middleware.js');//引入中间件

module.exports = {

    layout:'lavico/member/layout'
    ,view: 'lavico/templates/member/card_blank/bind.html'
    ,process:function(seed, nut){
        //nut.disabled = true ;
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
                }else{
                    if(doc&&doc.HaiLanMemberInfo&&doc.HaiLanMemberInfo.action=='bind'){
                        nut.model.error = "you_has_bound_already" ;
                    }else{
                        nut.model.error = "null"
                    }
                }
            }));
        });

        this.step(function(){
            nut.model.wxid = wxid ;
        });

    }
    ,viewIn:function(){

            /*前端设计JS*/
            $('#loading').hide();//隐藏加载框

            var wxid = $('#wxid').val();

            /*判断是否会员已经绑定*/
            if($("#error").val()=="you_has_bound_already"){

                window.popupStyle2.on("您已绑定",function(event){
                    window.location.href="/lavico/member/index?wxid="+wxid;
                });

            }
            /*申请会员卡*/
            $("#registerUrl").click(function(){
                window.location.href="/lavico/member/card_blank/register?wxid="+wxid;
            });

            $("#no_member_telephone .confirm .applybtn").click(function(){
                window.location.href="/lavico/member/card_blank/register?wxid="+wxid;
            });

            /*绑定会员卡*/
            $("#bindUrl").click(function(){
                window.location.href="/lavico/member/card_blank/bind?wxid="+wxid;
            });

            /*会员管理*/
            $('#memberUrl').click(function(){
                window.location.href="/lavico/member/index?wxid="+wxid;
            });

            /*会员管理*/
            $('#member_manage').click(function(){
                window.location.href="/lavico/member/index?wxid="+wxid;
            });

            /*取消绑定*/
            $(".cancel").click(function(){
                $(this).parents('.popup').hide();
            });


            /*后端编程JS*/
            /*验证码-开始*/
            var timer60Seconds;
            var flag = 0;

            /*第一步：判断手机号码的状态*/
            $("#submit_1").click(function(){

                if($("#userTel").val() =='' || !(/^1[358]\d{9}$/i.test($("#userTel").val())) ){
                    window.popupStyle2.on("请输入正确的手机号码",function(event){});
                    return false;
                }
                /*判断手机号码是否存在*/
                $('#loading').show();//显示正在加载
                var userTel = $("#userTel").val();
                var wxid = $("#wxid").val();
                $.ajax({
                    url:'/lavico/member/card_blank/bind:checkTel',
                    type:'POST',
                    data:{
                        'userTel':userTel,
                    }}).done(function(data){

                        $('#loading').hide();//显示正在加载
                        var returnJson = data || {};

                        if(returnJson.success == true){
                            if(returnJson.info == 'tel_checked_true'){

                                //验证过的手机号码，不需要输入卡号，就可以绑定成功
                                var memberId = returnJson.memberId || '';
                                if(memberId.length > 0){
                                    $('#memberId').val(returnJson.memberId);
                                }
                                $('#tel_checked_status').val('tel_checked_true');
                                get_id_code();//发送验证码


                            }else if(returnJson.info == 'tel_checked_false'){

                                //无验证的手机号码，需要输入卡号


                                 $('#tel_checked_status').val('tel_checked_false');
                                 $('#true_card_number').show();

                            }else{

                                window.popupStyle2.on("网络不稳定，请稍后再尝试",function(event){
                                });

                            }
                        }else if(returnJson.success == false){

                            if(returnJson.error == 'tel_exists_false'){
                                //alert('抱歉，此号码绑定不成功；原因可能是您尚未成为品牌会员，可返回申领会员卡；如有其他疑问，欢迎咨询客服热线4001008866');
                                window.popupStyle2.on("抱歉，此号码绑定不成功",function(event){});

                            }else if(returnJson.error == 'network_error'){

                                //alert('网络不稳定，请稍后再尝试');

                                window.popupStyle2.on("网络不稳定，请稍后再尝试",function(event){
                                });

                            }else{

                                window.popupStyle2.on("网络不稳定，请稍后再尝试",function(event){
                                });

                            }
                        }else{

                            window.popupStyle2.on("网络不稳定，请稍后再尝试",function(event){
                            });
                        }
                    });
                /*判断手机号码是否验证过*/

            });

            /*第二步：判断卡号是否正确*/
            $('#submit_2').click(function(){

                var userTel = $('#userTel').val();
                var userCardNumber = $('#userCardNumber').val().toUpperCase();
                var wxid = $('#wxid').val();

                if(userCardNumber.length == 0 ){

                    $('#cardnumber_empty').show();
                    return	false;

                }
                if(userTel.length == 0 || !(/^1[358]\d{9}$/i.test(userTel)) ){

                    window.popupStyle2.on("请输入正确的手机号码",function(event){
                    });
                    return	false;

                }
                $('#loading').show();
                $.ajax({
                    url:'/lavico/member/card_blank/bind:checkCardNum',
                    type:'POST',
                    data:{
                        'userTel':userTel,
                        'userCardNumber':userCardNumber,
                        'wxid':wxid
                    }}).done(function(data){
                        $('#loading').hide();

                        var returnJson = data || {};
                        //console.log(returnJson);
                        if(returnJson.success == true){
                            if(returnJson.error == 'please_enter_next_step'){

                                get_id_code();//发送验证码
                            }
                        }else if(returnJson.success == false){
                            if(returnJson.error == 'cardnum_no_found'){
                                //$('#telephone_cardnumber_no_match').show();
                                console.log('系统没有查找到此卡号，请核对后重新输入,可能由于此卡号绑定的不是第一步的手机号码');
                                $('#telephone_cardnumber_no_match').show();
                                //window.popupStyle2.on("系统没有查找到此卡号",function(event){});


                            }else if(returnJson.error == 'network_error'){

                                window.popupStyle2.on("网络不稳定，请稍后再尝试",function(event){
                                });
                            }else{

                                window.popupStyle2.on("网络不稳定，请稍后再尝试",function(event){
                                });
                            }
                        }else{

                            window.popupStyle2.on("网络不稳定，请稍后再尝试",function(event){
                            });
                        }


                    });

            });
            /*第三步*/
            $('#submit_3').click(function(){
                //submitCheck();
                var wxid = $('#wxid').val();
                var userTel = $('#userTel').val();
                var userCaptcha = $('#userCaptcha').val();
                var userCardNumber = $.trim($('#userCardNumber').val()).toUpperCase();
                var userName = $.trim($('#userName').val());
                var tel_checked_status = $.trim($('#tel_checked_status').val());
                var memberId = $.trim($('#memberId').val());

                if(userCaptcha ==''){
                    window.popupStyle2.on("请填写验证码",function(event){
                    });
                    return false;
                }
                if(userName ==''){

                    window.popupStyle2.on("请填写姓名",function(event){
                    });
                    return false;
                }
                $('#loading').show();
                $.ajax({
                    url:'/lavico/member/card_blank/bind:checkCaptcha',
                    type:'POST',
                    data:{
                        'wxid':wxid,
                        'userTel':userTel,
                        'userCaptcha':userCaptcha,
                        'userCardNumber':userCardNumber,
                        'userName':userName,
                        'tel_checked_status':tel_checked_status,
                        'memberId':memberId
                    }}).done(function(data){
                        $('#loading').hide();
                        var returnJson = data || {};
                        //alert(returnJson.success);
                        //console.log(returnJson);
                        if(returnJson.success == true){
                            if(returnJson.info == 'bind_success'){
                                if($('#tel_checked_status').val() == 'tel_checked_false'){
                                    //alert('绑定成功');
                                    //$('#member_manage').show();
                                    window.popupStyle2.on("绑定成功",function(event){
                                        window.location.href="/lavico/member/index?wxid="+wxid;
                                    });

                                }else if($('#tel_checked_status').val() == 'tel_checked_true'){
                                    //alert('绑定成功');
                                    //$('#member_manage').show();
                                    window.popupStyle2.on("绑定成功",function(event){
                                        window.location.href="/lavico/member/index?wxid="+wxid;
                                    });

                                    //以前绑定过的手机号码，不再继续输入卡号码
                                }
                            }else{

                                window.popupStyle2.on("网络不稳定，请稍后再尝试",function(event){
                                });
                            }
                        }else if(returnJson.success == false){
                            if(returnJson.error == 'captcha_is_error'){

                                window.popupStyle2.on("验证码错误,请重新输入",function(event){
                                });

                            }else if(returnJson.error == 'network_error'){

                                window.popupStyle2.on("网络不稳定，请稍后再尝试",function(event){
                                });

                            }else{
                                var _info = returnJson.error;
                                if(_info == "该微信ID已是本品牌会员，请检查！"){
                                    window.popupStyle2.on("您已经是我们的会员",function(event){
                                    });
                                }else{
                                    window.popupStyle2.on("网络不稳定，请稍后再尝试",function(event){
                                    });
                                }
                            }
                        }else{
                            window.popupStyle2.on("网络不稳定，请稍后再尝试",function(event){
                            });
                        }
                    });
                //$('#submit').click();
            });

            /*发送验证码*/
            var get_id_code = function(){

                var userTel = $("#userTel").val();

                if(userTel =='' || !(/^1[358]\d{9}$/i.test(userTel)) ){
                    window.popupStyle2.on("请输入正确的手机号码",function(event){
                    });
                    return	false;
                }
                if(flag){
                    return false;
                }
                /*判断手机号码是否存在*/
                $('#loading').show();//显示正在加载

                $.ajax({
                    url:'/lavico/member/card_blank/bind:checkTel',
                    type:'POST',
                    data:{
                        'userTel':userTel,
                    }}).done(function(data){
                        $('#loading').hide();//显示正在加载
                        var returnJson = data || {};
                        if(returnJson.success == true){
                            if(returnJson.info == 'tel_checked_true'){
                                //alert('验证码已发送，请查看您的手机');
                                id_code(function(){
                                    if($('#id_code').val() == 'send_captcha_success'){
                                        $("#submit_1").removeAttr("disabled");
                                    }
                                    $('#tel_checked_status').val('tel_checked_true');
                                });//发送验证码
                                //验证过的手机号码，不需要输入卡号，就可以绑定成功

                            }else if(returnJson.info == 'tel_checked_false'){
                                //alert('验证码已发送，请查看您的手机');
                                id_code(function(){
                                    if($('#id_code').val() == 'send_captcha_success'){
                                        $("#submit_1").removeAttr("disabled");
                                    }
                                    $('#tel_checked_status').val('tel_checked_false');
                                });//发送验证码

                            }else{

                                window.popupStyle2.on("网络不稳定，请稍后再尝试",function(event){});

                            }
                        }else if(returnJson.success == false){
                            if(returnJson.error == 'tel_exists_false'){

                                window.popupStyle2.on("抱歉，此号码绑定不成功；原因可能是您尚未成为品牌会员，可返回注册会员；如有其他疑问，欢迎咨询客服热线400-100-8866",function(event){});

                            }else if(returnJson.error == 'network_error'){
                                window.popupStyle2.on("网络不稳定，请稍后再尝试",function(event){});
                            }else{
                                window.popupStyle2.on("网络不稳定，请稍后再尝试",function(event){});
                            }
                        }else{
                            window.popupStyle2.on("网络不稳定，请稍后再尝试",function(event){});
                        }
                    });
                /*判断手机号码是否验证过*/
                /*发送手机验证码*/

                /*产生验证码*/

                var id_code = function(callback){
                    if(flag){
                        return false;
                    }
                    flag = 1;
                    var userTel = $('#userTel').val();//获取手机号码
                    $.get('/lavico/member/card_blank/code:id_code',{
                            'userTel' : userTel
                        },function(data){
                            data = eval('('+data+')');
                            if(data.result == 'ofen'){

                                window.popupStyle2.on("您好，您获取的验证码太频繁，稍等再尝试吧",function(event){});
                                $('#id_code').val('please_try_it_again_later');
                                flag = 0;
                            }else if(data.result == 'ok'){
                                set_interval();
                                $('#userCaptcha').val(data.id_code);
                                $('#id_code').val('send_captcha_success');
                                console.log('验证码发送成功，请在2分钟内输入！');
                                $(".popup").hide();
                            }else{

                                window.popupStyle2.on("网络不稳定，请稍后再尝试",function(event){});
                                $('#id_code').val('send_captcha_fail');
                            }
                            callback();//回调函数
                        }
                    );
                }

            }

            function set_interval(){
                clearInterval(timer60Seconds);
                var time = 60;
                $(".get_id_code").html('('+time+')重新获取');
                timer60Seconds = setInterval(function(){
                    time--;
                    if(time == 0){
                        clearInterval(timer60Seconds);
                        re_get_code();
                    }else{
                        $(".get_id_code").html('('+time+')重新获取');
                        var _imgSrc = $(".get_id_code").css('background');
                        var _reg = /verify_bg\.png/;

                        if(!_reg.test(_imgSrc)){
                            $(".get_id_code").css({"background":"url(/lavico/public/images/verify_bg.png)","background-size":"100% 100%"});
                        }
                    }
                },1000);
            }
            function re_get_code(){
                $(".get_id_code").html('获取验证码').css({"background":"url(/lavico/public/images/verify_bg_01.png)","background-size":"100% 100%"});
                flag = 0;
            }
            /*验证码-结束*/


    //ViewIn End
    }
    ,actions:{

        checkTel:{
            layout:null,
            view:null,
            process:function(seed,nut){
                nut.disabled = true ;
                var userTel = seed.userTel;
                var then = this;
                var memberId = 'undefined';

                /*判断手机号码是否存在*/
                this.step(function(){
                    //lavico.middleware/L/Member/CheckMobileExists?mobile=18651125967
                    middleware.request( "Member/CheckMobileExists",{
                        'mobile':userTel
                    },this.hold(
                        function(err,doc){
                            var dataJson = JSON.parse(doc);
                            /*{"exists":false} */
                            /*{"exists":true} */
                            //console.log(dataJson.exists);
                            //console.log(typeof dataJson.exists);
                            if(dataJson.exists == false){
                                then.res.writeHead(200, { 'Content-Type': 'application/json' });
                                then.res.write('{"success":false,"error":"tel_exists_false"}');
                                then.res.end();
                                then.terminate();
                            }else if(dataJson.exists == true){
                                //继续进行下一步
//                                then.res.writeHead(200, { 'Content-Type': 'application/json' });
//                                then.res.write('{"success":true,"info":"tel_exists_true"}');
//                                then.res.end();
//                                then.terminate();
                                  memberId = dataJson.memberId || 'undefined';
                            }else{
                                then.res.writeHead(200, { 'Content-Type': 'application/json' });
                                then.res.write('{"success":false,"error":"network_error"}');
                                then.res.end();
                                then.terminate();
                            }
                        }
                    ));
                });

                /*判断手机号码是否验证过*/
                this.step(function(){
                    //lavico.middleware/L/Member/CheckMobileExists?mobile=18651125967
                    middleware.request( "Member/IsMobileChecked",{
                        'mobile':userTel
                    },this.hold(
                        function(err,doc){
                            var dataJson = JSON.parse(doc);
                            /*{"checked":false} */
                            /*{"checked":true} */
                            //console.log(dataJson.checked);
                            //console.log(typeof dataJson.checked);
                            if(dataJson.checked == true){
                                then.res.writeHead(200, { 'Content-Type': 'application/json' });

                                if(memberId !='undefined'){
                                    then.res.write('{"success":true,"info":"tel_checked_true","memberId":"'+memberId+'"}');
                                }else{
                                    then.res.write('{"success":true,"info":"tel_checked_true"}');
                                }
                                then.res.end();
                                then.terminate();
                            }else if(dataJson.checked == false){
                                then.res.writeHead(200, { 'Content-Type': 'application/json' });
                                then.res.write('{"success":true,"info":"tel_checked_false"}');
                                then.res.end();
                                then.terminate();
                            }else{
                                then.res.writeHead(200, { 'Content-Type': 'application/json' });
                                then.res.write('{"success":false,"error":"network_error"}');
                                then.res.end();
                                then.terminate();
                            }
                        }
                    ));
                });

            }
        },
        checkCardNum:{
                        layout:null,
                        view:null,
                        process:function(seed,nut){
                            nut.disabled = true;
                            var userCardNumber = seed.userCardNumber;
                            var userTel = seed.userTel;
                            var wxid = seed.wxid;
                            this.step(function(){
                                middleware.request( "Member/IsMobileAndOldcardValid",{
                                    'oldcard':userCardNumber,
                                    'mobile':userTel
                                },this.hold(
                                    function(err,doc){
                                        var dataJson = JSON.parse(doc);
                                        /*
                                        * { valid: true }
                                        * */
                                        //console.log(dataJson);
                                        //console.log(dataJson.valid);
                                        if(dataJson.valid == true){

                                            this.res.writeHead(200, { 'Content-Type': 'application/json' });
                                            this.res.write('{"success":true,"error":"please_enter_next_step"}');
                                            this.res.end();
                                            this.terminate();

                                        }else if(dataJson.valid == false){
                                            this.res.writeHead(200, { 'Content-Type': 'application/json' });
                                            this.res.write('{"success":false,"error":"cardnum_no_found"}');
                                            this.res.end();
                                            this.terminate();
                                        }else{
                                            /*如果由于网络原因没有绑定成功，需要暂时保存数据*/
                                            helper.db.coll('welab/customers').update({wechatid:wxid},{
                                                $set:{
                                                    'mobile':userTel,
                                                    'HaiLanMemberInfo':{
                                                        'action':'binding',
                                                        'userCardNumber':userCardNumber,
                                                        'lastModified':new Date().getTime()
                                                    }
                                                }
                                            },function(err,doc){
                                            });
                                            this.res.writeHead(200, { 'Content-Type': 'application/json' });
                                            this.res.write('{"success":false,"error":"network_error"}');
                                            this.res.end();
                                            this.terminate();
                                        }
                                    })
                                );
                            });
                        }
        },
        /*最后一步，判断验证码是否正确后，如果正确，则直接绑定卡号，否则，返回。*/
        checkCaptcha:{
                        layout:null,
                        view:null,
                        process:function(seed,nut){
                            nut.disabled = true ;
                            var wxid = seed.wxid;
                            var userTel = seed.userTel;
                            var userCardNumber = seed.userCardNumber;
                            var userCaptcha = seed.userCaptcha;//验证码
                            var userName = seed.userName;
                            var tel_checked_status = seed.tel_checked_status;//手机号码绑定状态
                            var checkCaptcha = seed.checkCaptcha;
                            var memberId = seed.memberId || 'undefined';
                            var card_number;//显示在会员中心的帐号

                            /*
                            * 'wxid':wxid,
                             'userTel':userTel,
                             'userCaptcha':userCaptcha,
                             'userCardNumber':userCardNumber
                            */
                            /*获取CRM的用户资料*/
                            var email;
                            var profession;
                            var province;
                            var city;
                            var address;
                            var favoriteStyle;
                            var favoriteColor;
                            var birthday;


                            var then = this;
                            var type = 0;   //获取卡类型    0 是没获取到   // 01: 白卡, 02: 普通VIP卡, 03: 白金VIP卡
                            var data_request;
                            var data_doc;
                            /*"success": true,
                             "MEMBER_ID": NumberInt(9270174) */
                            var dataBindJson;//绑定后返回信息


                            /*判断验证码输入的是否正确*/
                            this.step(function(){
                                if(!this.req.session.set_id_code_time || !this.req.session.id_code || (this.req.session.set_id_code_time + 300000) < new Date().getTime() || seed.userCaptcha != this.req.session.id_code){
                                then.res.writeHead(200, { 'Content-Type': 'application/json' });
                                //then.res.write('{"code_error":"id_code_error"}');
                                then.res.write('{"success":false,"error":"captcha_is_error"}');
                                then.terminate();
                                }
				            });
                            this.step(function(){
                                if(tel_checked_status == 'tel_checked_true' && memberId != 'undefined' && memberId){
                                    //先解绑，后绑定
                                    var data_request = {
                                        'openid':wxid,
                                        'MEMBER_ID':memberId,
                                    };
                                    middleware.request( "Member/Unbind",
                                        data_request,
                                        this.hold(function(err,doc){
                                            var dataJson = JSON.parse(doc);
                                            helper.db.coll("lavico/feeds").insert(
                                                {
                                                    'createTime':new Date().getTime(),
                                                    'wxid':seed.wxid,
                                                    'action':"unbind",
                                                    'request':data_request,
                                                    'reponse':dataJson,
                                                },
                                                function(err,req_doc){
                                                    err&&console.log(req_doc);
                                                }
                                            );
                                            return doc;
                                        }));
                                    //
                                }
                            });
                            /*进行下一步*/

                            this.step(function(){
                                data_request = {
                                    openid:wxid,
                                    MOBILE_TELEPHONE_NO:userTel,
                                    MEM_OLDCARD_NO:userCardNumber,
                                    MEM_PSN_CNAME:userName
                                };
                                middleware.request( "Member/Bind",
                                    data_request,
                                    this.hold(function(err,doc){
                                        var dataJson = JSON.parse(doc);
                                        helper.db.coll("lavico/feeds").insert(
                                            {
                                                'createTime':new Date().getTime(),
                                                'wxid':seed.wxid,
                                                'action':"bind",
                                                'request':data_request,
                                                'reponse':dataJson
                                            },
                                            function(err,req_doc){
                                                err&console.log(req_doc);
                                            }
                                        );
                                        data_doc = doc;
                                        //console.log(doc);
                                        return doc;
                                    }));
                            });


                            this.step(function(doc){
                                var dataJson = JSON.parse(data_doc);
                                if(dataJson.success == true){
                                    middleware.request( "Member/Level/"+dataJson.MEMBER_ID,{
                                        }
                                        ,then.hold(function(err,req_doc){
                                            var member_level = JSON.parse(req_doc);
                                            if(member_level.level == '01'){
                                                type = 1;//01: 白卡
                                            }else if(member_level.level == '02'){
                                                type = 2;//02:普通VIP卡
                                            }else if(member_level.level == '03'){
                                                type = 3;//03：白金VIP卡
                                            }else{
                                                type = 0;//不确定卡类型
                                            }
                                        }));
                                }else if(dataJson.success == false){
                                    //该微信ID已是本品牌会员，请检查！
                                    var _error = dataJson.error;
                                    this.res.writeHead(200, { 'Content-Type': 'application/json' });
                                    this.res.write('{"success":false,"error":"'+_error+'"}');
                                    this.res.end();

                                }else{
                                    this.res.writeHead(200, { 'Content-Type': 'application/json' });
                                    this.res.write('{"success":false,"error":"network_error"}');
                                    this.res.end();
                                }
                                return doc;
                            });

                            this.step(function(){

                                //获取我的会员卡的头部显示的卡号Member/Info/9121535
                                /*{"info":
                                {"MEM_PSN_EMAIL":null,
                                "MEM_INDUSTRY":null,
                                "MEM_PSN_BIRTHDAY":1393948800000,
                                "PROVINCE":null,
                                "CITY":null,
                                "MEM_PSN_ADDRESS":null,
                                "MEM_PSN_HOPPY":null,
                                "MEM_PSN_COLOR":null,
                                "MEM_CARD_NO":"L9121533"}
                                }
                                * */
                                var dataJson = JSON.parse(data_doc);
                                middleware.request( "Member/Info/"+dataJson.MEMBER_ID,{
                                    }
                                    ,then.hold(function(err,req_doc){
                                        var member_info = JSON.parse(req_doc);

                                        card_number = member_info.info.MEM_CARD_NO;
                                        /*用户个人资料*/
                                        email = member_info.info.MEM_PSN_EMAIL;
                                        profession = member_info.info.MEM_INDUSTRY;
                                        province = member_info.info.PROVINCE;
                                        city = member_info.info.CITY;
                                        address = member_info.info.MEM_PSN_ADDRESS;
                                        favoriteStyle = member_info.info.MEM_PSN_HOPPY;
                                        favoriteColor = member_info.info.MEM_PSN_COLOR;
                                        birthday = member_info.info.MEM_PSN_BIRTHDAY;

                                    }));


                            });



                            this.step(function(doc){
                                var dataJson = JSON.parse(data_doc);
                                if(dataJson.success == true){
                                    this.req.session.id_code = '';
                                    helper.db.coll('welab/customers').update({wechatid:wxid},{
                                        $set:{
                                            'realname':userName,
                                            'mobile':userTel,
                                            'isRegister':true,
                                            'registerTime':new Date().getTime(),
                                            'HaiLanMemberInfo':{
                                                'memberID':dataJson.MEMBER_ID,
                                                'action':'bind',
                                                'cardNumber':card_number,
                                                //'userCardNumber':userCardNumber,
                                                'lastModified':new Date().getTime(),
                                                'type':type
                                            },
                                            'email':email,
                                            'profession':profession,
                                            'province':province,
                                            'city':city,
                                            'address':address,
                                            'favoriteStyle':favoriteStyle,
                                            'favoriteColor':favoriteColor,
                                            'birthday':birthday
                                        }
                                    },function(err,doc){
                                        err&&console.log(doc);
                                    });
                                }else if(dataJson.success == false){
                                    var _error = dataJson.error;
                                    this.res.writeHead(200, { 'Content-Type': 'application/json' });
                                    this.res.write('{"success":false,"error":"'+_error+'"}');
                                    this.res.end();
                                    this.terminate();
                                }else{
                                    var _error = 'network_error';
                                    this.res.writeHead(200, { 'Content-Type': 'application/json' });
                                    this.res.write('{"success":false,"error":"'+_error+'"}');
                                    this.res.end();
                                    this.terminate();
                                }
                            });

                            this.step(function(){
                                this.res.writeHead(200, { 'Content-Type': 'application/json' });
                                this.res.write('{"success":true,"info":"bind_success"}');
                                this.res.end();
                                this.terminate();
                            });


                        }
                }
    }
}
