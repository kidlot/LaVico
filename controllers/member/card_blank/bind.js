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

            var fourNum;
            var userTel;
            var getRandomNum = function(num){
                //获得一个随机Num位的数
                var arr =[];
                for(var i = 1; i <= num; i++){
                    arr.push(Math.floor(Math.random()*10));
                }
                var str = arr.join('');
                return str;
            }
            $('#getCaptcha').click(function(){
                // 向短信接口发送一个手机号码和短信内容，短信内容包括验证码

                userTel = $('#userTel').val();
                if(userTel ==''){
                    alert('请输入手机号码！');
                    return false;
                }
                var reg = /^1[358]\d{9}$/g;
                if(!reg.test(userTel)){
                    alert('请输入有效的手机号码！');
                }
                fourNum = getRandomNum(4);

                console.log(fourNum);
            });
            $('#submit').click(function(){
                if($('#userCaptcha').val()==''){
                    alert('请填写验证码');
                    return false;
                }
                if(String($('#userCaptcha').val()) != fourNum){
                    alert('验证码不正确');
                    return false;
                }

                var userCardNumber = $('#userCardNumber').val();
                var userName = $('#userName').val();
                var userTel = $('#userTel').val();

                if(userCardNumber==''){
                    alert('请填写卡号');
                    return false;
                }
                if(userName==''){
                    alert('请填写手机号吗');
                    return false;
                }

                $.ajax({
                    url:'/lavico/member/card_blank/bind:save',
                    type:'POST',
                    data:{
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
                            console.log(typeof(dataJson));
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
                    // middleware.APPORBIND 申请，绑定
                    middleware.request( middleware.APPORBIND,{
                        BRAND_CODE:"L", //品牌编号
                        MIC_ID:wxid, //微信账号ID
                        MEM_APP_NO:"LS", //申请单号
                        TYPE:"1", //0：新会员申请，1：老会员绑定
                        MEM_PSN_CNAME:userName, //会员姓名
                        MEM_PSN_SEX:"1", //性别 0：女，1：男
                        MEM_PSN_BIRTHDAY:"2012-11-11", //生日
                        MOBILE_TELEPHONE_NO:userTel, //手机号
                        MEM_OLDCARD_NO:userCardNumber //老卡编号
                        //6226 0458 3697 4321
                    },returnDoc.hold(function(err,doc){
                        console.log(doc);
                        var data = JSON.stringify(doc);
                        returnDoc.res.writeHead(200, { 'Content-Type': 'application/json' });
                        returnDoc.res.write(data);
                        returnDoc.res.end();
                    }));
                    console.log('++++++++++++');
                    //6226045836974321
                }
        }
    }
}