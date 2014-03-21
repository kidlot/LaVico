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
				  if(!this.req.session.id_code || (set_id_code_time + 60000) < new Date().getTime() || nut.id_code != this.req.session.id_code){
				    console.log('aa');
            returnDoc.res.writeHead(200, { 'Content-Type': 'application/json' });
            returnDoc.res.write("{result:'code_error'}");
            returnDoc.res.end();
            returnDoc.terminate();				  
				  }else{
				    console.log('aa');
            returnDoc.res.writeHead(200, { 'Content-Type': 'application/json' });
            returnDoc.res.write("{result:'aa'}");
            returnDoc.res.end();
            returnDoc.terminate();						  
				  }
				});
				
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
		},
		
		id_code:{
		  process:function(seed,nut){
		    nut.disabled = true ;
		    then = this;
		    this.step(function(){
		      var set_id_code_time = this.req.session.set_id_code_time;
		      console.log(set_id_code_time);
		      console.log(new Date().getTime());
          if(set_id_code_time && (set_id_code_time + 30000) > new Date().getTime()){
            then.res.writeHead(200, { 'Content-Type': 'text/plain' });
            then.res.write("{result:'ofen'}");
            then.res.end();       
          }else{
            var id_code  =get_id_code();
            this.req.session.id_code = id_code;
            this.req.session.set_id_code_time = new Date().getTime();
            console.log(id_code);
            then.res.writeHead(200, { 'Content-Type': 'text/plain' });
            then.res.write("{result:'ok'}");
            then.res.end(); 
          }
		    });
		  }
		}
	}
}


function get_id_code(){
  var text_range = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','0','1','2','3','4','5','6','7','8','9'];
  var id_code = '';
  for(var i = 0; i < 5 ; i++){
    var _i = Math.floor(Math.random()*text_range.length) ;
    id_code += text_range[_i]; 
  }
  return id_code;
}
