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
        var wxid = seed.wxid ? seed.wxid : 'undefined';//预先定义微信ID
        nut.model.wxid = wxid ;
        this.step(function(){
            if(wxid == 'undefined'){
                this.terminate();
            }
        });

    }
    ,viewIn:function(){

            var wxid = jQuery('#wxid').val();
            if(wxid == 'undefined'){
                alert('请登陆微信后，查看本页面');
                jQuery('body').hide();
            }
            $('#submit').click(function(){
                //submitCheck();
                var wxid = $('#wxid').val();
                var userName = $('#userName').val();
                var userTel = $('#userTel').val();
                var userCaptcha = $('#userCaptcha').val();
                var userCardNumber = $.trim($('#userCardNumber').val());
                var reg = /^L\d{12}$/;
                if(userCardNumber ==''){
                    alert('请填写卡号');
                    return false;
                }
//                if(!reg.test(userCardNumber)){
//                    alert('请输入有效的卡号');
//                    return false;
//                }

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

                if(userCaptcha ==''){
                    alert('请填写验证码');
                    return false;
                }
                $.ajax({
                    url:'/lavico/member/card_blank/bind:save',
                    type:'POST',
                    data:{
                        'wxid':wxid,
                        'userCardNumber':userCardNumber,
                        'userName':userName,
                        'userTel':userTel,
                        'id_code':userCaptcha
                    }}).done(function(data){
                        var returnJson = data || {};
                        if(returnJson.issuccessed == true){
                            alert('绑定成功');
                        }else if(returnJson.issuccessed == false){
                            alert(returnJson.error);
                        }else if(returnJson.code_error){
                            alert('验证码错误');
                        }else{
                            alert('网络不稳定，请稍后再尝试');
                        }
                    });
            //$('#submit').click();
            });
    //ViewIn End
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
				                    var then = this;
				                    var type = 0;   //获取卡类型    0 是没获取到   // 01: 白卡, 02: 普通VIP卡, 03: 白金VIP卡
				                    var data_request;
				                    var data_doc;
				                    this.step(function(){
				                      if(!this.req.session.set_id_code_time || !this.req.session.id_code || (this.req.session.set_id_code_time + 300000) < new Date().getTime() || seed.id_code != this.req.session.id_code){
                                then.res.writeHead(200, { 'Content-Type': 'application/json' });
                                then.res.write('{"code_error":"id_code_error"}');
                                then.res.end();
                                then.terminate();
                              }
				                    });
                            this.step(function(){
			                        data_request = {
                                  openid:wxid,
                                  MOBILE_TELEPHONE_NO:userTel,
                                  MEM_OLDCARD_NO:userCardNumber,
                                  MEM_PSN_CNAME:userName		  
			                        };
			                        console.log(data_request);
                              middleware.request( "/lavico.middleware/MemberBind",
                                  data_request,
                                  this.hold(function(err,doc){
                                    var dataJson = JSON.parse(doc);
                                    helper.db.coll("lavico/user/logs").insert(
                                        {
                                            'createTime':new Date().getTime(),
                                            'wxid':seed.wxid,
                                            'userCardNumber':userCardNumber,
                                            'userName':userName,
                                            'userTel':userTel,
                                            'action':"bind",
                                            'data':dataJson,
                                            'request':data_request
                                        },
                                        function(err,req_doc){
                                        }
                                    );
                                    data_doc = doc;
                                    return doc;
                              }));
                            });
                            
                            
                            this.step(function(doc){
                              var dataJson = JSON.parse(data_doc);
                              if(dataJson.issuccessed == true){
                                middleware.request( "/lavico.middleware/Points",{
                                      MEMBER_ID:dataJson.MEMBER_ID
                                    }
                                    ,then.hold(function(err,req_doc){
                                      console.log(req_doc);  
                                      var member_level = eval('('+req_doc+')');
                                      console.log(member_level);
                                      if(member_level.level == '01'){
                                        type = 1;
                                      }else if(member_level.level == '02'){
                                        type = 2;
                                      }else if(member_level.level == '03'){
                                        type = 3;
                                      }else{
                                        type = 0;
                                      }
                                      console.log(type);
                                }));                                  
                              }else{
                                console.log(dataJson.issuccessed);
                              }
                              return doc;
                            });

                            this.step(function(doc){
                                var dataJson = JSON.parse(data_doc);
                                if(dataJson.issuccessed == true){
                                    then.req.session.id_code = '';
                                    helper.db.coll('welab/customers').update({wechatid:wxid},{
                                        $set:{
                                            'realname':userName,
                                            'mobile':userTel,
                                            'HaiLanMemberInfo':{
                                                'memberID':dataJson.MEMBER_ID,
                                                'action':'bind',
                                                'lastModified':new Date().getTime(),
                                                'type':type
                                            }
                                        }
                                      },function(err,doc){
                                    });
                                }
                                then.res.writeHead(200, { 'Content-Type': 'application/json' });
                                then.res.write(data_doc);
                                then.res.end();
                                then.terminate();
                            });
                        }
                }
    }
}
