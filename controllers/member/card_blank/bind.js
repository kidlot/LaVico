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

                //userCarNumberCheck();//检验卡号的合法性

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
                var MEMBER_ID;//返回的数据
                var successTip = '绑定成功';

                //submitCheck
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
                        /*返回的数据
                        * {"MEMBER_ID":9114883,"issuccessed":true,"error":""}
                        *  MEMBER_ID: 海澜CRM会员ID
                        *  issuccessed: true/false 操作是否成功
                        *  error: 如果失败，返回的错误提示
                        * */
                        var returnJson = data || {};
                        if(returnJson.issuccessed == true){
                            //绑定成功之后，跳转到card_member页面

                            alert(successTip);

                            //MEMBER_ID = returnJson.MEMBER_ID;
                            //window.location.href='/lavico/member/card_member/index?wxid='+wxid+'&MEMBER_ID='+MEMBER_ID;


                        }else if(returnJson.issuccessed == false){
                            alert(returnJson.error);

                            /*假设绑定会员，成功之后*/
//                            MEMBER_ID = '9114883';
//                            window.location.href='/lavico/member/card_member/index?wxid='+wxid+'&member_id='+MEMBER_ID;
                            /*假设绑定会员，成功之后*/

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
                            var returnDoc;//中间件返回的数据,不过它是字符串格式的JSON
                            var dataJson; //中间件返回的数据,它是原数据转化之后的JSON
				                    var then = this;
				                    this.step(function(){
				                      if(!this.req.session.set_id_code_time || !this.req.session.id_code || (this.req.session.set_id_code_time + 300000) < new Date().getTime() || seed.id_code != this.req.session.id_code){
                                then.res.writeHead(200, { 'Content-Type': 'application/json' });
                                then.res.write('{"code_error":"id_code_error"}');
                                then.res.end();
                                then.terminate();
                              }
				                    });
                            this.step(function(){

                            //第一步，请求中间件接口

                                middleware.request( "/lavico.middleware/MemberBind",{
                                    openid:wxid,
                                    MOBILE_TELEPHONE_NO:userTel,
                                    MEM_OLDCARD_NO:userCardNumber,
                                    MEM_PSN_CNAME:userName
                                },this.hold(function(err,doc){

                                    dataJson = JSON.parse(doc);
                                    returnDoc = doc;
                                    console.log(dataJson);
                                    //记录用户动作
                                    helper.db.coll("lavico/user/logs").insert(
                                        {
                                            'createTime':new Date().getTime(),
                                            'wxid':seed.wxid,
                                            'userCardNumber':userCardNumber,
                                            'userName':userName,
                                            'userTel':userTel,
                                            'action':"申请绑定",
                                            'result':dataJson
                                        },
                                        function(err, doc){
                                            console.log(doc);
                                        }
                                    );
                                    return dataJson;
                                }));
                                

                            });


                            this.step(function(){

                                helper.db.coll('welab/customers').findOne({wechatid:wxid},this.hold(function(err, doc){return doc; }));
                            });
                            this.step(function(doc){
                                if(dataJson.issuccessed == true){
                                    //中间件返回的数据如果是绑定成功，则需要更新数据库
                                    console.log('dd')
                                    //then.req.session.id_code = '';
                                    console.log('cc')
                                    if(!doc){
                                        //如果找不到此用户，先添加此wxid用户
                                        helper.db.coll('welab/customers').insert({wechatid:wxid},this.hold(function(err, doc){

                                            console.log(doc);
                                            helper.db.coll('welab/customers').update({wechatid:wxid},{
                                                $set:{
                                                    'realname':userName,
                                                    'mobile':userTel,
                                                    'HaiLanMemberInfo':{
                                                        'createTime':new Date().getTime(),
                                                        'memberID':dataJson.MEMBER_ID,
                                                        'action':'bind',
                                                        'lastModified':new Date().getTime()
                                                    }
                                                }
                                            }, function(err, doc){

                                            });

                                        }));
                                    }else{
                                        //找到此用户，直接更新用户信息                                    
                                        helper.db.coll('welab/customers').update({wechatid:wxid},{
                                            $set:{
                                                'realname':userName,
                                                'mobile':userTel,
                                                'HaiLanMemberInfo':{
                                                    'createTime':new Date().getTime(),
                                                    'memberID':dataJson.MEMBER_ID,
                                                    'action':'bind'
                                                }
                                            }
                                        },function(err,doc){
                                            console.log(doc);
                                        });

                                    }

                                }else if(dataJson.issuccessed == false){

                                    console.log('会员申请老卡绑定失败');

                                }else{

                                    console.log('会员申请老卡绑定失败，可能由于网络原因');

                                }

                            });
                            this.step(function(){
                                this.res.writeHead(200, { 'Content-Type': 'application/json' });
                                this.res.write(returnDoc);
                                this.res.end();
                            });


                        //Process End
                        }
                //Save End
                }
    //Actions End
    }
}
