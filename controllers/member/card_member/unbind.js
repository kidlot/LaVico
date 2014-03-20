/**
 * Created by David Xu on 3/12/14.
 */
/**
 * Created by David Xu on 3/12/14.
 * 会员解除绑定
 */
var middleware = require('lavico/lib/middleware.js');//引入中间件

module.exports = {

    layout:null
    ,view: 'lavico/templates/member/card_member/unbind.html'
    ,process:function(seed, nut){
        var wxid = seed.wxid ? seed.wxid : '1237';//预先定义微信ID
        nut.model.wxid = wxid ;
        // middleware.APPORBIND 申请，绑定
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
            fourNum = parseInt(getRandomNum(4));
            $('#userCaptcha').val(fourNum);

            console.log(fourNum);
        });
        $('#submit').click(function(){

            var userCardNumber = $('#userCardNumber').val();
            var userTel = $('#userTel').val();
            var userCaptcha = $('#userCaptcha').val();

            $.ajax({
                url:'/lavico/member/card_member/unbind:unlock',
                type:'POST',
                data:{
                    'wxid':wxid,
                    'userCardNumber':userCardNumber,
                    'userTel':userTel
                },
                success:function(data){
                    console.log(data);
                },
                error:function(msg){
                    console.log(msg);
                }
            });

        });
    }
    ,actions:{
        unlock:{
            layout:null,
            view:null,
            process:function(seed,nut){
                //解除绑定
                nut.disabled = true ;
                var wxid = seed.wxid;
                var userCardNumber = seed.userCardNumber;
                var userTel = seed.userTel;
                var _this = this;

                middleware.request( "/lavico.middleware/MemberUnbind",{
                    openid:wxid,
                    MEMBER_ID:userCardNumber,
                },_this.hold(function(err,doc){
//  openid=1237&MEMBER_ID=9123084
//                    helper.db.coll("lavico/bind").insert({
//                        'createTime':new Date().getTime(),
//                        'wxid':wxid,
//                        'userCardNumber':userCardNumber,
//                        'userTel':userTel,
//                        'type':'unbind'
//                    },function(err, doc) {});

                    console.log(doc);
                    _this.res.writeHead(200, { 'Content-Type': 'application/json' });
                    _this.res.write(doc);
                    _this.res.end();

                }));

            }
        }


    }

}