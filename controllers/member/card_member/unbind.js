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
        var wxid = seed.wxid ? seed.wxid : 'undefined';//预先定义微信ID
        nut.model.wxid = wxid ;
        // middleware.APPORBIND 申请，绑定
    }
    ,viewIn:function(){

        var wxid = jQuery('#wxid').val();
        if(wxid == 'undefined'){
            alert('请登陆微信后，查看本页面');
            jQuery('body').hide();
        }

        var fourNum;
        var userTel;
        var getRandomNum = function(num){
            //获得一个随机Num位的数
            var arr =[];
            for(var i = 1; i <= num; i++){
                var _num = Math.floor(Math.random()*10);
                if(_num != 0){
                    arr.push(Math.floor(Math.random()*10));
                }else{
                    arr.push(1);
                }
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

            var wxid = $('#wxid').val();
            var member_ID = $('#member_ID').val();
            var userCaptcha = $('#userCaptcha').val();

            if(!userCaptcha){
                alert('请输入验证码！');
                return false;
            }
            if(fourNum != userCaptcha){
                alert('验证码不正确！');
                return false;
            }
            $.ajax({
                url:'/lavico/member/card_member/unbind:unlock',
                type:'POST',
                dataType:'json',
                data:{
                    'wxid':wxid,
                    'member_ID':member_ID
                },
                success:function(data){
                    var dataJson = data;
                    if(dataJson['issuccessed'] == 'true'){//dataJson.issuccessed
                        alert('解绑成功');
                    }else if (dataJson['issuccessed'] == 'false'){
                        alert('解绑失败');
                    }else{
                        alert('解绑失败，请稍后再尝试');
                    }
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
                var member_ID = seed.member_ID;
                var _this = this;

                middleware.request( "/lavico.middleware/MemberUnbind",{
                    'openid':wxid,
                    'MEMBER_ID':member_ID,
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