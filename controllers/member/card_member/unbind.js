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
        var wxid = seed.wxid;
        this.step(function(){
          helper.db.coll('welab/customers').findOne({wechatid:wxid},this.hold(function(err,doc){
            nut.model.MEMBER_ID = doc.HaiLanMemberInfo ? doc.HaiLanMemberInfo.memberID : "" ;
            nut.model.wxid = doc.wechatid;
            nut.model.mobile = doc.mobile;
          }));
        });        
        // middleware.APPORBIND 申请，绑定
    }
    ,viewIn:function(){

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
                          'HaiLanMemberInfo':{
                              'action':'unbind',
                              'lastModified':new Date().getTime()
                          }  
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
