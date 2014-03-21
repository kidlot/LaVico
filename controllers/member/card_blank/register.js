var middleware = require('../../../lib/middleware.js');
module.exports = {
	layout: null,
	view: "lavico/templates/member/card_blank/register.html",
	process: function(seed,nut)
	{
		nut.model.uid = seed.uid;
	},
	actions:{
		apply_card:{
			process:function(seed,nut){
				nut.disabled = true ;
				var returnDoc = this;
				this.step(function(){
          //openid=1234&MEM_PSN_CNAME=alee&MEM_PSN_SEX=1&MOBILE_TELEPHONE_NO=18812341235&MEM_PSN_BIRTHDAY=1982-10-11					
					middleware.request('/lavico.middleware/MemberApply',{
						openid:seed.uid, //微信账号ID
						MEM_PSN_CNAME:seed.name, //会员姓名
						MEM_PSN_SEX:seed.sex, //性别 0：女，1：男
						MEM_PSN_BIRTHDAY:seed.birthday, //生日
						MOBILE_TELEPHONE_NO:seed.mobile, //手机号
					},this.hold(function(err,doc){
					  doc_json = JSON.parse(doc); 
					  if(doc_json.MEMBER_ID){
              helper.db.coll("lavico/member").insert({
                  createTime:new Date().getTime(),
                  wxid:seed.uid,
                  userCardNumber:doc_json.MEMBER_ID,
                  userName:seed.name,
                  userTel:seed.mobile,
                  type:1,         //普通会员卡
                  action:1       // 申请  
              },this.hold(function(err, insert_doc) {
                console.log(err);
                returnDoc.res.writeHead(200, { 'Content-Type': 'application/json' });
                returnDoc.res.write(doc);
                returnDoc.res.end();           
              }));					    
					  }else{
              returnDoc.res.writeHead(200, { 'Content-Type': 'application/json' });
              returnDoc.res.write(doc);
              returnDoc.res.end();			    
					  }
					}))
				});									
			}
		}
	}
}
