var middleware = require('../../../lib/middleware.js');
module.exports = {
	layout: null,
	view: "lavico/templates/member/card_blank/register.html",
	process: function(seed,nut)
	{

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
                }
            }));
        });
        this.step(function(){
            nut.model.uid = wxid ;
        });
	},
    viewIn:function(){

        /*前端JS*/
        $(function () {
            var $day = $("#day"),
                $month = $("#month"),
                $year = $("#year");

            var dDate = new Date(),
                dCurYear = dDate.getFullYear(),
                str = "";
            for (var i = dCurYear - 100; i < dCurYear + 1; i++) {
                if (i == dCurYear) {
                    str = "<option value=" + i + " selected=true>" + i + "</option>";
                } else {
                    str = "<option value=" + i + ">" + i + "</option>";
                }
                $year.append(str);
            }

            for (var i = 1; i <= 12; i++) {

                if (i == (dDate.getMonth() + 1)) {
                    str = "<option value=" + i + " selected=true>" + i + "</option>";
                } else {
                    str = "<option value=" + i + ">" + i + "</option>";
                }
                $month.append(str);
            }
            TUpdateCal($year.val(), $month.val());
            $("#year,#month").bind("change", function(){
                TUpdateCal($year.val(),$month.val());
            });
        });

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
                    str = "<option value=" + d + " selected=true>" + d + "</option>";
                } else {
                    str = "<option value=" + d + ">" + d + "</option>";
                }
                $("#day").append(str);
            }
        }

        var timer60Seconds;
        var flag = 0;

        /*获得验证码*/
        $("#get_id_code").click(function(){
            if($("#mobile").val() =='' || !(/^1[358]\d{9}$/i.test($("#mobile").val())) ){
                alert("请输入正确的手机号码");
                return	false;
            }
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

                            //Lavico远端系统不存在此手机号码
                            alert('此手机号已被使用，如果确认是您的手机，请点击会员绑定！');
                            //发送验证码
                            //验证过的手机号码
                        }else if(returnJson.info == 'tel_checked_false'){

                            //Lavico远端系统不存在此手机号码
                            alert('此手机号已被使用，如果确认是您的手机，请点击会员绑定！');

                        }else{
                            alert('网络接口不稳定，请稍后再尝试');
                        }
                    }else if(returnJson.success == false){

                        if(returnJson.error == 'tel_exists_false'){

                            //Lavico远端系统不存在此手机号码
                            //正常获取验证码
                            getCaptcha();

                        }else if(returnJson.error == 'network_error'){
                            alert('网络接口不稳定，请稍后再尝试');
                        }else{
                            alert('网络接口不稳定，请稍后再尝试');
                        }

                    }else{
                        alert('网络不稳定，请稍后再尝试');
                    }
                });

            /*判断手机号码是否验证过*/

        });
        /*获取验证码*/
        var getCaptcha = function(){
            flag = 1;
            $.get('/lavico/member/card_blank/code:id_code',{
                },function(data){
                    data = eval('('+data+')');
                    if(data.result == 'ofen'){
                        alert('请稍后再获取');
                        flag = 0;
                    }else if(data.result == 'ok'){
                        set_interval();
                        $('#id_code').val(data.id_code);
                        alert('验证码发送成功，请在2分钟内输入');
                    }else{
                        alert('网络不稳定，请稍后再尝试')
                    }
                }
            );
        }
        function set_interval(){
            clearInterval(timer60Seconds);
            var time = 60;
            $("#get_id_code").val('请'+time+'秒稍后再获取');
            timer60Seconds = setInterval(function(){
                time--;
                if(time == 0){
                    clearInterval(timer60Seconds);
                    re_get_code();
                }else{
                    $("#get_id_code").val('请'+time+'秒稍后再获取');
                }
            },1000);
        }
        function re_get_code(){
            $("#get_id_code").val('获取验证码');
            flag = 0;
        }


        $("#submit").click(function(){
            if($("#name").val() == ''){
                alert("请输入姓名");
                $("#name").focus();
                return	false;
            }
            if($("#sex").val() == ''){
                alert("请选择性别");
                $("#sex").focus();
                return	false;
            }
            if($("#year").val() == ''){
                alert("请选择出生年月日");
                return	false;
            }
            if($("#month").val() == ''){
                alert("请选择出生年月日");
                return	false;
            }
            if($("#day").val() == ''){
                alert("请选择出生年月日");
                return	false;
            }
            if($("#mobile").val() =='' || !(/^1[358]\d{9}$/i.test($("#mobile").val())) ){
                alert("请输入正确的手机号码");
                return	false;
            }
            if($("#id_code").val() == ''){
                alert("验证码错误");
                return	false;
            }
            $.get('/lavico/member/card_blank/register:apply_card',{
                    uid : $("#uid").val(),
                    name : $("#name").val(),
                    sex : $("#sex").val(),
                    birthday : $("#year").val()+'-'+$("#month").val()+'-'+$('#day').val(),
                    mobile : $("#mobile").val(),
                    id_code : $("#id_code").val()
                },
                function(data){
                    data = eval("("+data+")");
                    if(data.success){
                        if(data.error){
                            alert(data.error);
                        }else{
                            alert("恭喜你，注册成功");
                        }
                        return false;
                    }else if(data.code_error){
                        alert("验证码错误");
                        return false;
                    }else{
                        alert(data.error);
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
		apply_card:{
			process:function(seed,nut){
				nut.disabled = true ;
				var then = this;
				this.step(function(){
				  if(!this.req.session.set_id_code_time || !this.req.session.id_code || (this.req.session.set_id_code_time + 300000) < new Date().getTime() || seed.id_code != this.req.session.id_code){
                    then.res.writeHead(200, { 'Content-Type': 'text/plain' });
                    then.res.write("{code_error:'id_code_error'}");
                    then.res.end();
                    then.terminate();
                  }
				});
				
				
				this.step(function(){
				  var data_request = {
						openid:seed.uid, //微信账号ID
						MEM_PSN_CNAME:seed.name, //会员姓名
						MEM_PSN_SEX:seed.sex, //性别 0：女，1：男
						MEM_PSN_BIRTHDAY:seed.birthday, //生日
						MOBILE_TELEPHONE_NO:seed.mobile, //手机号				  
				  };

                  middleware.request('Member/Apply',
                         data_request
					  ,this.hold(function(err,doc){
					  doc_json = JSON.parse(doc);

                        helper.db.coll("lavico/user/logs").insert(
                            {
                                'createTime':new Date().getTime(),
                                'wxid':seed.uid,
                                'action':"apply",
                                'data':doc_json,
                                'request':data_request
                            },
                            function(err, doc){});


					  if(doc_json.success == true){
					    then.req.session.id_code = '';
					    var sex = '';
					    if(seed.sex == '1'){
					      sex = 'male';
					    }else if(seed.sex === '0'){
					      sex = 'female';
					    }
                          helper.db.coll('welab/customers').update({wechatid:seed.uid},{
                              $set:{
                                'realname':seed.name,
                                'mobile':seed.mobile,
                                'birthday':new Date(seed.birthday).getTime(),
                                'gender':sex,
                                'HaiLanMemberInfo':{
                                    'memberID':doc_json.MEMBER_ID,
                                    'action':'bind',
                                    'lastModified':new Date().getTime(),
                                    'type':1
                                }
                              }
                          },this.hold(function(err, insert_doc) {
                            then.res.writeHead(200, { 'Content-Type': 'text/plain' });
                            then.res.write(doc);
                            then.res.end();
                          }));
					    }else if(doc_json.success == false){
                          then.res.writeHead(200, { 'Content-Type': 'text/plain' });
                          then.res.write(doc);
                          then.res.end();
					  }
					  }))
				});									
			}
		}
	}
}

