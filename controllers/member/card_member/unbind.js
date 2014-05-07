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
          helper.db.coll('welab/customers').findOne({wechatid:wxid},this.hold(function(err,doc){
            if(doc){
                nut.model.MEMBER_ID = doc.HaiLanMemberInfo ? doc.HaiLanMemberInfo.memberID : "undefined" ;
                nut.model.bindStatus = doc.HaiLanMemberInfo ? doc.HaiLanMemberInfo.action : "undefined" ;
                nut.model.wxid = wxid;
                nut.model.mobile = doc.mobile || 'undefined';
                if(nut.model.mobile == 'undefined'){
                    nut.disable();//不显示模版
                    this.res.writeHead(200, { 'Content-Type': 'application/json' });
                    this.res.write('{"error":"mobile_not_binded"}');
                    this.res.end();
                    this.terminate();
                }
                if(nut.model.MEMBER_ID == 'undefined'){
                    nut.disable();//不显示模版
                    this.res.writeHead(200, { 'Content-Type': 'application/json' });
                    this.res.write('{"error":"memberid_not_binded"}');
                    this.res.end();
                    this.terminate();
                }
            }else{

                nut.disable();//不显示模版
                this.res.writeHead(200, { 'Content-Type': 'application/json' });
                this.res.write('{"error":"wxid_no_found"}');
                this.res.end();
                this.terminate();
            }
          }));
        });        
        // middleware.APPORBIND 申请，绑定
    }
    ,viewIn:function(){
        /*验证码开始*/
        var timer60Seconds;
        var flag = 0;
        var checkTel = function(){

            var userTel = $('#userTel').val();
            var wxid = $('#wxid').val();

            $.ajax({
                url:'/lavico/member/card_member/unbind:checkTel',
                type:'POST',
                data:{
                    'wxid':wxid,
                    'userTel':userTel
                }}).done(function(data){

                });
        }
        $("#get_id_code").click(function(){
            if($("#userTel").val() =='' || !(/^1[358]\d{9}$/i.test($("#userTel").val())) ){
                alert("请输入正确的手机号码");
                return	false;
            }
            if(flag){
                return false;
            }
            flag = 1;
            $.get('/lavico/member/card_blank/code:id_code',{
                    'mobile':$("#userTel").val()
                },function(data){
                    data = eval('('+data+')');
                    if(data.result == 'ofen'){
                        alert('请稍后再获取！');
                        flag = 0;
                    }else if(data.result == 'ok'){
                        set_interval();
                        $('#userCaptcha').val(data.id_code);
                        alert('验证码发送成功，请在2分钟内输入');
                    }else{
                        alert('网络不稳定，请稍后再试')
                    }
                }
            );
        });
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
        /*验证码结束*/
        var wxid = jQuery('#wxid').val();
        if(wxid == 'undefined'){
            alert('请登陆微信后，查看本页面');
            jQuery('body').hide();
        }
        $('#submit').click(function(){

            var wxid = $('#wxid').val();
            var MEMBER_ID = $('#MEMBER_ID').val();
            var userCaptcha = $('#userCaptcha').val();

            if(!userCaptcha){
                alert('请输入验证码！');
                return false;
            }
            if(!MEMBER_ID){
              alert('MEMBER_ID miss');
              return false;
            }
            $.ajax({
                url:'/lavico/member/card_member/unbind:unlock',
                type:'POST',
                dataType:'json',
                data:{
                    'wxid':wxid,
                    'MEMBER_ID':MEMBER_ID,
                    'id_code':userCaptcha
                },
                success:function(data){
                    var dataJson = data;
                    if(dataJson['success'] == true){//dataJson.issuccessed
                        alert('解绑成功');
                    }else if (dataJson['success'] == false){
                        alert('解绑失败');
                    }else if(dataJson.code_error){
                        alert('验证码错误');
                    }else{
                        alert('解绑失败，请稍后再尝试');
                    }
                },
                error:function(msg){
                }
            });

        });
    }
    ,actions:{
        checkTel:{
            layout:null,
            view:null,
            process:function(seed,nut){
                nut.disabled = true ;
                var wxid = seed.wxid;
                var mobile = seed.mobile;
                helper.db.coll('welab/customers').findOne({wechatid:wxid},this.hold(function(err, doc){
                    if(doc && doc.mobile && doc.HaiLanMemberInfo.memberID ){
                        _mobile =  doc.mobile;
                        if(mobile == _mobile){
                            nut.disable();//不显示模版
                            this.res.writeHead(200, { 'Content-Type': 'application/json' });
                            this.res.write('{"success":true,"info":""}');
                            this.res.end();
                            this.terminate();
                        }else{
                            nut.disable();//不显示模版
                            this.res.writeHead(200, { 'Content-Type': 'application/json' });
                            this.res.write('{"success":false,"error":"mobile_not_correct"}');//发送过来的手机号码不正确
                            this.res.end();
                            this.terminate();
                        }
                    }else{
                        _mobile = 'undefined';
                        nut.disable();//不显示模版
                        this.res.writeHead(200, { 'Content-Type': 'application/json' });
                        this.res.write('{"success":false,"error":"mobile_not_binded"}');
                        this.res.end();
                        this.terminate();
                    }
                }));
            }
        },
        unlock:{
            layout:null,
            view:null,
            process:function(seed,nut){
                //解除绑定
                nut.disabled = true ;
                var wxid = seed.wxid;
                var MEMBER_ID = seed.MEMBER_ID;
                var _this = this;

                this.step(function(){
                  if(!this.req.session.set_id_code_time || !this.req.session.id_code || (this.req.session.set_id_code_time + 300000) < new Date().getTime() || seed.id_code != this.req.session.id_code){
                    _this.res.writeHead(200, { 'Content-Type': 'application/json' });
                    _this.res.write('{"code_error":"id_code_error"}');
                    _this.res.end();
                    _this.terminate();
                  }
                });
                var data_request = {
                    'openid':wxid,
                    'MEMBER_ID':MEMBER_ID, 
                };
                
                this.step(function(){
                  middleware.request( "Member/Unbind",
                    data_request,
                    _this.hold(function(err,doc){
                      var dataJson = JSON.parse(doc);
                      helper.db.coll("lavico/user/logs").insert(
                          {
                              'createTime':new Date().getTime(),
                              'wxid':seed.wxid,
                              'action':"unbind",
                              'data':dataJson,
                              'request':data_request
                          },
                          function(err,req_doc){
                          }
                      ); 
                      return doc;
                  }));
                });
                this.step(function(doc){
                  var dataJson = JSON.parse(doc);
                  if(dataJson.success == true){
				            _this.req.session.id_code = '';
                    helper.db.coll('welab/customers').update({wechatid:wxid},{
                        $set:{
                          'HaiLanMemberInfo.action':"unbind",
                          'HaiLanMemberInfo.lastModified':new Date().getTime()
                        }
                    },this.hold(function(err, insert_doc) {
                      _this.res.writeHead(200, { 'Content-Type': 'application/json' });
                      _this.res.write(doc);
                      _this.res.end();           
                    }));	 
                  }else if(dataJson.success == false){
                    _this.res.writeHead(200, { 'Content-Type': 'application/json' });
                    _this.res.write(doc);
                    _this.res.end();		
                  }
                });
            }
        }


    }

}
