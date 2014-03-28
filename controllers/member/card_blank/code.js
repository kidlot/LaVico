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
  //var text_range = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','0','1','2','3','4','5','6','7','8','9'];
  var text_range = ['0','1','2','3','4','5','6','7','8','9'];
  var id_code = '';
  for(var i = 0; i < 5 ; i++){
    var _i = Math.floor(Math.random()*text_range.length) ;
    id_code += text_range[_i]; 
  }
  return id_code;
}
