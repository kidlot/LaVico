var middleware = require('lavico/lib/middleware.js');//引入中间件

module.exports = {

    layout:null,

    view:'lavico/templates/member/card_member/info.html',

    process:function(seed, nut){

        var wxid = seed.wxid;
        nut.model.wxid = wxid;
        this.step(function(){
          helper.db.coll('welab/customers').findOne({wechatid:wxid},this.hold(function(err,doc){
            if(doc && doc.mobile && doc.realname && doc.birthday && doc.gender){
              nut.model.mobile = doc.mobile;
              nut.model.realname = doc.realname;
              var date =   new Date(parseInt(doc.birthday));
              nut.model.birthday_year = date.getFullYear() + '年';
              nut.model.birthday_month = date.getMonth() + '月';
              nut.model.birthday_date = date.getDate() +'日';
              nut.model.gender = (doc.gender && doc.gender == 'male') ? '男' : ((doc.gender && doc.gender == 'female') ? '女' : '' );
              nut.model.is_send = 1;            
            }else{
              nut.model.mobile = '';
              nut.model.realname = '';
              nut.model.birthday_year = '';
              nut.model.birthday_month = '';
              nut.model.birthday_date = '';
              nut.model.gender = '';
              nut.model.is_send = 0;             
            }
          }));
        });
    },

    viewIn:function(){

        $('#submit').click(function(){
            if(!$("#wxid").val()){
              alert('请先绑定会员');
              return false;
            }        
            if(!$("#is_send").val()){
              alert('请先绑定会员');
              return false;
            }
            var email = $('#email').val();
            var profession = $('#profession').val();
            var province = $('#province').val();
            var city = $('#city').val();
            var address = $('#address').val();
            var favoriteStyle = $('#favoriteStyle').val();
            var favoriteColor = $('#favoriteColor').val();
            if(!email || !/^.+@.+\..+$/.test(email)){
              alert('邮箱格式错误');
              return false;
            }
            if(!profession){
              alert('请输入行业');
              return false;
            } 
            if(!province){
              alert('请输入省份');
              return false;
            } 
            if(!city){
              alert('请输入城市');
              return false;
            } 
            if(!address){
              alert('请输入地址');
              return false;
            } 
            if(!favoriteStyle){
              alert('请输入喜好款式');
              return false;
            } 
            if(!favoriteColor){
              alert('请输入喜欢颜色');
              return false;
            }     
            $.get('/lavico/member/card_member/info:Modified',
              {
                'wxid':$('#wxid').val(),
                'email':email,
                'profession':profession,
                'province':province,
                'city':city,
                'address':address,
                'favoriteStyle':favoriteStyle,
                'favoriteColor':favoriteColor,              
              },
              function(data){
                if(data.result == 'ok'){
                  alert('修改成功');
                }else if(data.result == 'fail'){
                  alert('修改失败');
                }else{
                  alert('修改失败');
                }                
            });
        });
    },

    actions:{
        Modified:{
            layout:null,
            view:null,
            process:function(seed,nut){
              this.step(function(){
                nut.disabled = true ;
                var then =this;
                var data_request = {
                    'email':seed.email,
                    'profession':seed.profession,
                    'province':seed.province,
                    'city':seed.city,
                    'address':seed.address,
                    'favoriteStyle':seed.favoriteStyle,
                    'favoriteColor':seed.favoriteColor,
                    'complete':1                
                };
                helper.db.coll("lavico/user/logs").insert(
                    {
                        'createTime':new Date().getTime(),
                        'wxid':seed.wxid,
                        'action':"info",
                        'request':data_request
                    },
                    function(err, doc){
                    }
                );		                
                helper.db.coll('welab/customers').update({wechatid:seed.wxid},
                  {$set:data_request},  
                  this.hold(function(err, doc){
                    then.res.writeHead(200, { 'Content-Type': 'application/json' });
                    if(doc){
                      then.res.write('{"result":"ok"}');
                    }else{
                      then.res.write('{"result":"fail"}');
                    }
                    then.res.end();
                    then.terminate();
                }));
              });
            }
        }
    }

}
