var middleware = require('lavico/lib/middleware.js');//引入中间件
module.exports = {
	actions:{		
		id_code:{
		  process:function(seed,nut){
		    nut.disabled = true ;
		    then = this;
		    this.step(function(){

		      var set_id_code_time = this.req.session.set_id_code_time;
              if(set_id_code_time && (set_id_code_time + 30000) > new Date().getTime()){
                then.res.writeHead(200, { 'Content-Type': 'text/plain' });
                then.res.write("{result:'ofen'}");
                then.res.end();
              }else{
                var id_code  = get_id_code();
                this.req.session.id_code = id_code;
                this.req.session.set_id_code_time = new Date().getTime();


                var userTelArray = ['13964081593'];
                var mobile = seed.mobile;
                console.log(id_code);
                then.res.writeHead(200, { 'Content-Type': 'text/plain' });
                then.res.write('{"result":"ok","id_code":"'+id_code+'"}');

                /*验证码发送到手机号码*/
                  /*
                  /System/SendSMS?mobile=13964081593&content=hi~~【郎维高LaVico】
                  * */

                var _content = "您好，验证码为"+id_code+"，请在两分钟内填写，过期失效。";
                console.log(seed.mobile);
                if(userTel){

//                    middleware.request( "System/SendSMS",{
//                            'mobile':userTel,
//                            'content':_content+"【郎维高LaVico】"
//                        },this.hold(
//                        function(err,doc){
//                            then.res.end();
//                        })
//                    );

                }else{

                    for(var i=0;i<userTelArray.length;i++){
                        middleware.request( "System/SendSMS",{
                                'mobile':userTelArray[i],
                                'content':_content+"【郎维高LaVico】"
                            },this.hold(
                            function(err,doc){
                                then.res.end();
                            })
                        );
                    }
                }

              }
		    });
		  }
		}
	}
}


function get_id_code(){
  //var text_range = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','0','1','2','3','4','5','6','7','8','9'];
  var text_range = ['0','1','2','3','4','5','6','7','8','9'];
  var id_code = '';
  for(var i = 0; i < 5 ; i++){
    var _i = Math.floor(Math.random()*text_range.length) ;
    id_code += text_range[_i]; 
  }
  return id_code;
}
