var middleware = require('../../../lib/middleware.js');
module.exports = {
	layout: null,
	view: "lavico/templates/member/card_blank/register.html",
	process: function(seed,nut)
	{
		nut.model.uid = seed.wxid;
	},
	actions:{
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
                function(err, doc){
                }
            );					  
					  
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

