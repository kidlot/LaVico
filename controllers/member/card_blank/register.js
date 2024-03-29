/**
 * Created by David Xu on 3/12/14.
 * 会员注册
 */

var middleware = require('../../../lib/middleware.js');
module.exports = {
    layout:'lavico/layout',
	view: "lavico/templates/member/card_blank/register.html",
	process: function(seed,nut)
	{
        if(seed.go){
            nut.model.referer = decodeURIComponent(seed.go);//用户访问的上一个页面
        }else{
            nut.model.referer = this.req.headers.referer || '';//用户访问的上一个页面
        }

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

                if(doc){
                    nut.model.isFollow = doc.isFollow ? true : false;
                }else{
                    nut.model.isFollow = false;
                }


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
                    console.log('nut.model.error:'+nut.model.error);
                    console.log(doc);
                }
            }));
        });
        this.step(function(){
            nut.model.uid = wxid ;
        });
	},
    viewIn:function(){

        /*掩藏分享按钮*/
        window.hideShareButtion.on();

        /*前端设计JS*/
        $('#loading').hide();//隐藏加载框

        /*后端开发JS*/
        var wxid = $('#uid').val();
        var referer = $("#referer").val();//用户访问的上一个页面
        var host = window.location.host;
        var isFollow = $('#isFollow').val();
        /*判断是否会员已经绑定*/
        if($("#error").val()=="you_has_bound_already"){
            if(isFollow=='true'){

                window.popupStyle2.on("您已经是LaVico的会员",function(event){

                if(referer == window.location.href || referer.length == 0){
                    window.location.href = "/lavico/member/index?wxid="+wxid;
                }else{
                    window.location.href = referer;
                }
                });
            }else{
                window.popupStyle2.on('请搜索"LaVico朗维高"关注我们的官方微信，参加互动活动。',function(event){
                });
            }
        }

        if(isFollow!='true'){
            $('input').attr('disabled','disabled');
            $('#get_id_code').unbind();
            $('.apply').bind('click',function(){
                if($("#error").val()=="you_has_bound_already"){
                    window.popupStyle2.on('请搜索"LaVico朗维高"关注我们的官方微信',function(event){
                    });
                }else{
                    window.popupStyle2.on('请搜索"LaVico朗维高"关注我们的官方微信,才能绑定LaVico会员',function(event){
                    });
                }
            });
        }
        $("#year").change(function(){
            $(this).parent().find("input").val($(this).val()+'年');
        });

        $("#month").change(function(){
            $(this).parent().find("input").val($(this).val()+'月');
        });

        $("#day").change(function(){
            $(this).parent().find("input").val($(this).val()+'日');
        });

        $("#sex").click(function(){
            var _v = (parseInt($(this).val()) == 1) ? '男' : '女';
            $(this).parent().find("input").val(_v);
        });
        $("#sex").change(function(){
            var _v = (parseInt($(this).val()) == 1) ? '男' : '女';
            $(this).parent().find("input").val(_v);
        });


        /*申请会员卡*/
        $("#registerUrl").click(function(){
            window.location.href="/lavico/member/card_blank/register?wxid="+wxid;
        });

        /*绑定会员卡*/
        $("#bindUrl").click(function(){
            if(referer == window.location.href || referer.length == 0){
                window.location.href="/lavico/member/card_blank/bind?wxid="+wxid;
            }else{
                window.location.href="/lavico/member/card_blank/bind?wxid="+wxid+"&go="+encodeURIComponent(referer);
                //window.location.href="/lavico/member/card_blank/bind?wxid="+wxid;
            }
        });

        /*会员管理*/
        $('#memberUrl').click(function(){
            window.location.href="/lavico/member/index?wxid="+wxid;
        });


        /*年月日*/
        var $day = $("#day"),
            $month = $("#month"),
            $year = $("#year");

        var dDate = new Date(),
            dCurYear = dDate.getFullYear(),
            str = "";
        for (var i = dCurYear - 100; i < dCurYear + 1; i++) {
            if (i == dCurYear) {
                str = "<option value=" + i + " selected=true>" + i + "年</option>";
            } else {
                str = "<option value=" + i + ">" + i + "年</option>";
            }
            $year.append(str);
        }

        for (var i = 1; i <= 12; i++) {

            if (i == (dDate.getMonth() + 1)) {
                str = "<option value=" + i + " selected=true>" + i + "月</option>";
            } else {
                str = "<option value=" + i + ">" + i + "月</option>";
            }
            $month.append(str);
        }
        TUpdateCal($year.val(), $month.val());
        $("#year,#month").bind("change", function(){
            TUpdateCal($year.val(),$month.val());
        });

        /*设置年月日数值*/

        function TGetDaysInMonth(iMonth, iYear) {
            var dPrevDate = new Date(iYear, iMonth, 0);
            return dPrevDate.getDate();
        }

        function TUpdateCal(iYear, iMonth) {
            var dDate = new Date(),
                daysInMonth = TGetDaysInMonth(iMonth, iYear),
                str = "";

            $("#day").empty();

            for (var d = 1; d <= parseInt(daysInMonth); d++) {

                if (d == dDate.getDate()) {
                    str = "<option value=" + d + " selected=true>" + d + "日</option>";
                } else {
                    str = "<option value=" + d + ">" + d + "日</option>";
                }
                $("#day").append(str);
            }
        }

        var timer60Seconds;
        var flag = 0;

        /*获得验证码*/
        $("#get_id_code").bind('click',function(){
            if(isFollow!='true'){
                return	false;
            }
            if($("#mobile").val() =='' || !(/^1[358]\d{9}$/i.test($("#mobile").val())) ){
                window.popupStyle2.on("请输入正确的手机号码",function(event){});

                //alert("请输入正确的手机号码");
                return	false;
            }
			
			$.ajax({
                url:'/lavico/member/card_blank/register:check_verify_code',
                type:'POST',
				async:false,
                dataType:'json',
                data:{
                    'verify_code':$('#verify_code_txt').val()
                },
                success:function(data){
					if(data.code!=0){
						window.popupStyle2.on("校验码错误，请重新输入",function(event){});
						flag = 1;
					}else{
						flag = 0;
					}
				}
			})
			
			
            if(flag){
                return false;
            }
            /*获得验证码之前：判断手机号码的状态*/
            /*判断手机号码是否存在*/
            $('#loading').show();//显示正在加载


            var userTel = $("#mobile").val();
            var wxid = $("#uid").val();
            $.ajax({
                url:'/lavico/member/card_blank/register:checkTel',
                type:'POST',
                data:{
                    'userTel':userTel,
                }}).done(function(data){
                    $('#loading').hide();//掩藏正在加载

                    var returnJson = data || {};
                    if(returnJson.success == true){
                        if(returnJson.info == 'tel_checked_true'){

                            var memberId = returnJson.memberId || '';
                            window.popupStyle2.on("此手机号已被使用，如果确认是您的手机，请点击会员绑定！",function(event){});

                            //Lavico远端系统不存在此手机号码
                            //alert('此手机号已被使用，如果确认是您的手机，请点击会员绑定！');
                            //发送验证码
                            //验证过的手机号码
                        }else if(returnJson.info == 'tel_checked_false'){

                            //Lavico远端系统不存在此手机号码
                            //alert('此手机号已被使用，如果确认是您的手机，请点击会员绑定！');
                            window.popupStyle2.on("此手机号已被使用，如果确认是您的手机，请点击会员绑定！",function(event){});

                        }else{
                            window.popupStyle2.on("网络接口不稳定，请稍后再尝试",function(event){});

                            //alert('网络接口不稳定，请稍后再尝试');
                        }
                    }else if(returnJson.success == false){

                        if(returnJson.error == 'tel_exists_false'){

                            //Lavico远端系统不存在此手机号码
                            //正常获取验证码
                            getCaptcha();


                        }else if(returnJson.error == 'network_error'){
                            window.popupStyle2.on("网络接口不稳定，请稍后再尝试",function(event){});

                            //alert('网络不稳定，请稍后再尝试');
                        }else{

                            window.popupStyle2.on("网络接口不稳定，请稍后再尝试",function(event){});

                            //alert('网络不稳定，请稍后再尝试');
                        }

                    }else{
                        window.popupStyle2.on("网络接口不稳定，请稍后再尝试",function(event){});

                        //alert('网络不稳定，请稍后再尝试');
                    }
                });

            /*判断手机号码是否验证过*/

        });

        /*获取验证码*/
        var getCaptcha = function(){
            flag = 1;
            $.get('/lavico/member/card_blank/code:id_code',{
                    'userTel':$("#mobile").val()
                },function(data){
                    data = eval('('+data+')');
                    if(data.result == 'ofen'){

                        window.popupStyle2.on("请稍后再获取验证码",function(event){});

                        //alert('请稍后再获取');
                        flag = 0;
                    }else if(data.result == 'ok'){
                        set_interval();
                        //$('#id_code').val(data.id_code);//测试
                        console.log('验证码发送成功，请在2分钟内输入');
                    }else{

                        window.popupStyle2.on("网络不稳定，请稍后再尝试",function(event){});
                        //alert('网络不稳定，请稍后再尝试')
                    }
                }
            );
        }
        function set_interval(){
            clearInterval(timer60Seconds);
            var time = 60;//
            $("#get_id_code").html('('+time+')重新获取');
            timer60Seconds = setInterval(function(){
                time--;
                if(time == 0){
                    clearInterval(timer60Seconds);
                    re_get_code();
                }else{
                    $("#get_id_code").html('('+time+')重新获取');
                    var _imgSrc = $("#get_id_code").css('background');
                    var _reg = /verify_bg\.png/;

                    if(!_reg.test(_imgSrc)){
                        $("#get_id_code").css({ "background": "url(/lavico/public/images/verify_bg.png)", "background-size": "100% 100% " });
                    }
                }
            },1000);
        }
        function re_get_code(){

            $("#get_id_code").html('获取验证码').css({ "background": "url(/lavico/public/images/verify_bg_01.png)","background-size":"100% 100% "});
            flag = 0;
        }

		$('#submit_verify').click(function(){
				$.get('/lavico/member/card_blank/register:verify_code',function(data){
						//data = eval('('+data+')');
						$("#submit_verify").attr("src",data.code_img);
					})			
		
		})
		
		$(window).load(function() {
			$('#submit_verify').click();
		});
		
		
        /*提交注册*/
        $("#submit").click(function(){

            var name = $.trim($("#name").val());
            var nameReg = /^[\u4e00-\u9fa50-9A-Za-z]{1,}$/g;
            var sex = $("#model_sex_input").val();

            if(name.length == 0){
                window.popupStyle2.on("请输入姓名",function(event){});
                $("#name").val('');
                $("#name").focus();
                return	false;
            }

            if(!nameReg.test(name)){
                window.popupStyle2.on("请输入真实的姓名",function(event){});
                $("#name").focus();
                return	false;
            }
//            if(sex.length == 0||sex == '请选择'){
//                window.popupStyle2.on("请选择性别",function(event){});
//                $("#sex").focus();
//                return	false;
//            }
//            if($("#year").val().length  == 0||$("#model_year_input").val() == '年'){
//                window.popupStyle2.on("请选择生日的年",function(event){});
//                return	false;
//            }
//            if($("#month").val().length  == 0||$("#model_month_input").val() == '月'){
//                window.popupStyle2.on("请选择生日的月",function(event){});
//                return	false;
//            }
//            if($("#day").val().length  == 0||$("#model_day_input").val() == '日'){
//                window.popupStyle2.on("请选择生日的日",function(event){});
//                return	false;
//            }
            if($("#mobile").val() =='' || !(/^1[3458]\d{9}$/i.test($("#mobile").val())) ){
                window.popupStyle2.on("请输入正确的手机号码",function(event){});
                return	false;
            }
            if($("#id_code").val() == ''){
                window.popupStyle2.on("请填写验证码",function(event){});
                return	false;
            }
            $('#loading').show();//显示加载框

            $.get('/lavico/member/card_blank/register:apply_card',{
                    uid : $("#uid").val(),
                    name : name,
                    sex : $("#sex").val(),
                    birthday : $("#year").val()+'-'+$("#month").val()+'-'+$('#day').val(),
                    mobile : $("#mobile").val(),
                    id_code : $("#id_code").val()
                },
                function(data){
                    //console.log(data);
                    $('#loading').hide();//隐藏加载框

                    data = eval("("+data+")");
                    var _error = data.error;
                    if(data.success == true){
                        if(data.error){
                            //alert(data.error);
                            console.log(data.error);
                            //alert("网络不稳定，请稍后再尝试");
                            window.popupStyle2.on("网络不稳定，请稍后再尝试",function(event){});

                        }else{
                            //alert("恭喜你，注册成功");
                            window.popupStyle2.on("恭喜你，注册成功",function(event){
                                if(event == "confirm"){
                                    //window.history.go(-1);//返回上一页
                                    if(referer == window.location.href || referer.length == 0){
                                        window.location.href = "/lavico/member/index?wxid="+$("#uid").val()
                                    }else{
                                        window.location.href = referer;
                                    }
                                }
                            });

                        }
                        return false;

                    }else if(data.success == false){
                        if(data.error == "id_code_error"){
                            window.popupStyle2.on("验证码错误",function(event){});
                            //alert("验证码错误");
                            return false;
                        }else{
                            var _info = unescape(data.error);
                            if(_info == "该微信ID已是本品牌会员，请检查！"){
                                //alert("您已经绑定会员，请先解绑，再申领新卡");
                                window.popupStyle2.on("您已经是LaVico的会员",function(event){});

                            }else{

                                //alert("网络不稳定，请稍后再尝试");
                                window.popupStyle2.on("网络不稳定，请稍后再尝试",function(event){});

                            }
                        }
                    }else{
                        window.popupStyle2.on("网络不稳定，请稍后再尝试",function(event){});

                        //alert("网络不稳定，请稍后再尝试");
                        //console.log(data.error);
                        return false;
                    }
                }
            );
        });

    },
	actions:{

        /*判断手机号码是否可用*/
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
        /*注册会员*/
		apply_card:{
			process:function(seed,nut){

				nut.disabled = true ;
				var then = this;
                var data_request;
                var data_return_middleware;
                var member_type;
                var memberID;
                var sex = '';
                var data_request;
                var card_number;//显示在会员中心的帐号

				this.step(function(){
				  if(!this.req.session.set_id_code_time || !this.req.session.id_code || (this.req.session.set_id_code_time + 120000) < new Date().getTime() || seed.id_code != this.req.session.id_code){
                    //120000=2分钟
                    then.res.writeHead(200, { 'Content-Type': 'text/plain' });;
                    then.res.write('{"success":false,"error":"id_code_error"}');
                    then.res.end();
                    then.terminate();
                  }
				});

                this.step(function(){

                    data_request = {
                        openid:seed.uid, //微信账号ID
                        MEM_PSN_CNAME:seed.name, //会员姓名
                        //MEM_PSN_SEX:seed.sex, //性别 0：女，1：男
                        //MEM_PSN_BIRTHDAY:seed.birthday, //生日
                        MOBILE_TELEPHONE_NO:seed.mobile, //手机号
                    };

                    middleware.request('Member/Apply', data_request,this.hold(function(err,doc){

                        data_return_middleware = JSON.parse(doc);
                        //console.log(doc);
                        //console.log(data_return_middleware.success);
                        /*记录用户行为*/
                        helper.db.coll("welab/feeds").insert(
                            {
                                'createTime':new Date().getTime(),
                                'wxid':seed.uid,
                                'action':"apply",
                                'request':data_request,
                                'reponse':data_return_middleware,
                            },
                            function(err, doc){
                                err&&console.log(doc);
                            }
                        );
                    }));
                });

                this.step(function(){


                    if(data_return_middleware.success == true){

                        then.req.session.id_code = '';

//                        if(seed.sex == '1'){
//                            sex = 'male';
//                        }else if(seed.sex === '0'){
//                            sex = 'female';
//                        }
                        //获取member的用户类型
                        middleware.request( "Member/Level/"+data_return_middleware.MEMBER_ID,{
                            }
                            ,then.hold(function(err,req_doc){
                                var member_level = JSON.parse(req_doc);
                                if(member_level.level == '01'){
                                    type = 1;
                                }else if(member_level.level == '02'){
                                    type = 2;
                                }else if(member_level.level == '03'){
                                    type = 3;
                                }else{
                                    type = 0;
                                }
                            }));

                    }else if(data_return_middleware.success == false){

                        var _error = escape(data_return_middleware.error);//汉字编码

                        then.res.writeHead(200, { 'Content-Type': 'text/plain' });
                        then.res.write('{"success":false,"error":"'+_error+'"}');
                        then.res.end();
                        then.terminate();

                    }else{

                        then.res.writeHead(200, { 'Content-Type': 'text/plain' });
                        then.res.write('{"success":false,"error":"network_error"}');
                        then.res.end();
                        then.terminate();

                    }

                });

                this.step(function(){
                    //获取我的会员卡的头部显示的卡号Member/Info/9121535
                    middleware.request( "Member/Info/"+data_return_middleware.MEMBER_ID,{
                        }
                        ,then.hold(function(err,req_doc){
                            var member_info = JSON.parse(req_doc);
                            card_number = member_info.info.MEM_CARD_NO;
                        }));

                });

                this.step(function(){

                    helper.db.coll('welab/customers').update({wechatid:seed.uid},{
                        $set:{
                            'realname':seed.name,
                            'mobile':seed.mobile,
                            'isRegister':true,
                            'registerTime':new Date().getTime(),
                            //'birthday':new Date(seed.birthday).getTime(),
                            //'gender':sex,
                            'HaiLanMemberInfo':{
                                'memberID':data_return_middleware.MEMBER_ID,
                                'cardNumber':card_number,
                                'action':'bind',
                                'lastModified':new Date().getTime(),
                                'type':type
                            }
                        }
                    },this.hold(function(err, insert_doc) {
                        err&console.log(insert_doc);
                    }));
                });

                this.step(function(){

                    then.res.writeHead(200, { 'Content-Type': 'text/plain' });
                    then.res.write('{"success":true,"error":""}');
                    then.res.end();

                });
			}
		},verify_code:{
                        layout:null,
                        view:null,
                        process:function(seed,nut){
							nut.disabled = true ;
							var Canvas = require('canvas'); 
							console.log('code:');
                            var getRandom = function(start,end){  
								return start+Math.random()*(end-start);  
							};  
							var canvas = new Canvas(50,20); 
							var ctx = canvas.getContext('2d');  
							var s = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';  
							var code = '';  
							for(var i=0;i<4;i++){  
								code+= s.substr(parseInt(Math.random()*36),1);  
							}  
							var font= 'bold {FONTSIZE}px Impact';//"Bold Italic {FONTSIZE}px arial,sans-serif";//"13px sans-serif";  
							var start = 3;  
							var colors = ["rgb(255,165,0)","rgb(16,78,139)","rgb(0,139,0)","rgb(255,0,0)"];  
							var trans = {c:[-0.108,0.108],b:[-0.05,0.05]};  
							var fontsizes = [11,12,13,14,15,16];  
							for(var i in code){  
								ctx.font = font.replace('{FONTSIZE}',fontsizes[Math.round(Math.random()*10)%6]);  
								ctx.fillStyle = colors[Math.round(Math.random()*10)%4];//"rgba(0, 0, 200, 0.5)";  
								ctx.fillText(code[i], start, 15,50);  
								ctx.fillRect();  
								//con.translate(start,15);  
								//ctx.transform(a,b, c, d, e, f);  
								//参考：  
								//a:水平缩放，default：1 ,取值：0.89,1.32,-0.56等,  
								//b:y轴斜切，default：0 ,取值：-0.89,1.32等,  
								//c:x轴斜切，default：0 ,取值：-0.89,1.32等,  
								//d:垂直缩放，default：1 ,取值：-0.89，0.88,1.32等,  
								//e:平移，default：0 ,取值：-53,52等,  
								//f:纵称，default：0 ,取值：-53,52等,  
								var c = getRandom(trans['c'][0],trans['c'][1]);  
								var b = getRandom(trans['b'][0],trans['b'][1]);  
								//alert(c+','+b);  
								//ctx.transform(1,b, c, 1, 0, 0);  
								start+=11;  
							}
							
							console.log('code:'+code);  
							console.log('<img src="'+canvas.toDataURL()+'" alt="" />');  
							this.req.session.verify_code = code;
							this.res.writeHead(200, { 'Content-Type': 'application/json' });
							this.res.write('{"msg":"success","code_img":"'+canvas.toDataURL()+'"}');
							this.res.end();
							this.terminate();							
                           
                        }
						
						
			},check_verify_code:{
						layout:null,
                        view:null,
                        process:function(seed,nut){
							nut.disabled = true ;
							console.log("verify_code is :"+seed.verify_code);
							if(seed.verify_code.toUpperCase()!=this.req.session.verify_code.toUpperCase()){
								this.res.writeHead(200, { 'Content-Type': 'application/json' });
								this.res.write('{"code":"-1"}');
								this.res.end();
								this.terminate();							
							}else{
								this.res.writeHead(200, { 'Content-Type': 'application/json' });
								this.res.write('{"code":"0"}');
								this.res.end();
								this.terminate();	
							}
						}
			
			
			
			}
	}
}

