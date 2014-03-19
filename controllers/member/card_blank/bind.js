/**
 * Created by David Xu on 3/12/14.
 * 会员绑定
 */
var middleware = require('lavico/lib/middleware.js');//引入中间件

module.exports = {

    layout:null
    ,view: 'lavico/templates/member/card_blank/bind.html'
    ,process:function(seed, nut){
        //nut.disabled = true ;
        var wxid = seed.wxid ? seed.wxid : 'oBf_qJQ8nGyKu5vbnB1_u5okMT6Y';//预先定义微信ID
        nut.model.wxid = wxid ;
    }
    ,viewIn:function(){

            var fourNum;//4位验证码
            var userTel;//用户手机号吗
            var timer;//计时器 60秒
            var getRandomNum = function(num){
                //获得一个随机Num位的数
                var arr =[];
                for(var i = 1; i <= num; i++){
                    arr.push(Math.floor(Math.random()*10));
                }
                var str = arr.join('');
                return str;
            }

            var getCaptcha = function(){
                //获取验证码
                var userName = $('#userName').val();
                var userTel = $('#userTel').val();
                var userCaptcha = $('#userCaptcha').val();

                if(userName == ''){
                    alert('请输入您的姓名');
                    return false;
                }
                if(userTel ==''){
                    alert('请输入手机号码！');
                    return false;
                }
                var reg = /^1[358]\d{9}$/g;
                if(!reg.test(userTel)){
                    alert('请输入有效的手机号码！');
                    return false;
                }
                //userCarNumberCheck();//检验卡号的合法性

                var userCardNumber = $.trim($('#userCardNumber').val());
                var reg = /^\d{16}$/;
                if(userCardNumber ==''){
                    alert('请填写卡号');
                    return false;
                }
                if(!reg.test(userCardNumber)){
                    alert('请输入有效的卡号');
                    return false;
                }
                /////////////////////////

                console.log('激活按钮');
                fourNum = getRandomNum(4);
                console.log(fourNum);
                // 向短信接口发送一个手机号码和短信内容，短信内容包括验证码
                clearTimeout(timer);
                $('#getCaptcha').unbind('click', getCaptcha);
                $('#timer').html('60');
                $('#timer').show();
                timer = setTimeout(function(){
                    $('#getCaptcha').bind('click', getCaptcha);
                    clearInterval(timer60Seconds);
                },62000);
                var timer60Seconds = setInterval(function(){
                    if($('#timer').html() == 0){
                        $('#timer').hide();
                    }else{
                        $('#timer').html($('#timer').html() - 1);
                    }
                },1000);

            }

            var submitCheck = function(){


            }

            $('#getCaptcha').bind('click', getCaptcha);

            $('#submit').click(function(){

                //submitCheck();
                var wxid = $('#wxid').val();
                var userName = $('#userName').val();
                var userTel = $('#userTel').val();
                var userCaptcha = $('#userCaptcha').val();

                //userCarNumberCheck();//检验卡号的合法性

                var userCardNumber = $.trim($('#userCardNumber').val());
                var reg = /^\d{16}$/;
                if(userCardNumber ==''){
                    alert('请填写卡号');
                    return false;
                }
                if(!reg.test(userCardNumber)){
                    alert('请输入有效的卡号');
                    return false;
                }

                if(userName == ''){
                    alert('请输入您的姓名');
                    return false;
                }
                if(userTel==''){
                    alert('请填写手机号吗');
                    return false;
                }

                var reg = /^1[358]\d{9}$/g;
                if(!reg.test(userTel)){
                    alert('请输入有效的手机号码！');
                    return false;
                }

                if(userCaptcha==''){
                    alert('请填写验证码');
                    return false;
                }
                if(String(userCaptcha) != fourNum){
                    alert('验证码不正确');
                    return false;
                }

                //submitCheck
                $.ajax({
                    url:'/lavico/member/card_blank/bind:save',
                    type:'POST',
                    data:{
                        'wxid':wxid,
                        'userCardNumber':userCardNumber,
                        'userName':userName,
                        'userTel':userTel
                    },
                    success:function(data){
                        console.log('++++++++++++++++++++++');
                        console.log(data);
                        console.log('++++++++++++++++++++++');
                        var dataJson = eval('(' + data + ')');
                        if(dataJson.O_ISSUCCEED == 'Y'){
                            //成功
                            console.log(dataJson.O_HINT);
                            alert(dataJson.O_HINT);
                        }else if(dataJson.O_ISSUCCEED == 'N'){
                            //失败
                            console.log(dataJson.O_HINT);
                            alert(dataJson.O_HINT);
                        }else{
                            //其他错误
                            var otherError = 'O_ISSUCCEED的返回值有误';
                            console.log(otherError);
                            //console.log(typeof(dataJson));
                        }
                    },
                    error:function(msg){
                        console.log('----------------------');
                        alert(msg);
                        console.log('----------------------');

                    }
                });



            });



    }
    ,actions:{

        save:{
                layout:null,
                view:null,
                process:function(seed,nut){
                    nut.disabled = true ;
                    var wxid = seed.wxid;
                    var userCardNumber = seed.userCardNumber;
                    var userName = seed.userName;
                    var userTel = seed.userTel;

                    var returnDoc = this;

                    middleware.request( "/lavico.middleware/MemberBind",{
                        openid:wxid,
                        MOBILE_TELEPHONE_NO:userTel,
                        MEM_OLDCARD_NO:userCardNumber,
                        MEM_PSN_CNAME:userName
                    },function(err,doc){

                        console.log(doc);

                        helper.db.coll("lavico/bind").insert({
                            'createTime':new Date().getTime(),
                            'wxid':wxid,
                            'userCardNumber':userCardNumber,
                            'userName':userName,
                            'userTel':userTel,
                            'type':'bind'
                        },function(err, doc) {});

//                        returnDoc.res.writeHead(200, { 'Content-Type': 'application/json' });
//                        returnDoc.res.write(doc);
//                        returnDoc.res.end();
                        console.log('++++++++++++');

                    })




                    //6226045836974321
                }
        }
    }
}