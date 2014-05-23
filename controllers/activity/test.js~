var middleware = require('../../lib/middleware.js');
module.exports = {
    layout: null,
    view: "lavico/templates/activity/test.html",      
    process:function(seed,nut){
        nut.model.uid = seed.uid;
        nut.model.aid = seed.aid;       
    },
    actions:{
      shake: {
          process: function(seed,nut)
          { 
              nut.disabled = true ;
              var then = this;
              if(!seed.uid || !seed.aid){
                  write_info(then,'{"result":"miss"}'); 
                  return;            
              }
              var shake;
              this.step(function(){
                helper.db.coll('lavico/shake').findOne({_id:helper.db.id(seed.aid),switcher:'on',startDate:{$lte:new Date().getTime()},endDate:{$gte:new Date().getTime()}},this.hold(function(err,doc){
                   shake = doc;
                }));
              });
              
              this.step(function(){
                if(!shake){
                  write_info(then,'{"result":"cannot"}');              
                }       
              })

              var count=0;
              this.step(function(){
                 var start_time;
                 var now_timestamp = new Date().getTime();
                 if(shake.lottery_cycle == '1'){ // 自然天
                    start_time = now_timestamp - ( now_timestamp % 86400000 );
                 }else if(shake.lottery_cycle == '2'){// 自然周               
                    start_time = now_timestamp -86400000*(new Date().getDay()) - ( now_timestamp % 86400000 );
                 }else if(shake.lottery_cycle == '3'){//自然月
                    start_time = now_timestamp -86400000*(new Date().getDate()) - ( now_timestamp % 86400000 );
                 }else if(shake.lottery_cycle == '100'){//永久
                    start_time = 0;
                 }else{
                    write_info(then,'{"result":"something error"}');                                      
                 }
                 helper.db.coll('shake/shake').count({uid:seed.uid,aid:seed.aid,createDate:{$gte:start_time}},this.hold(function(err,doc){
                    count = doc;
                 }));
              })
              this.step(function(){
                 if(count >= shake.lottery_count){
                    write_info(then,'{"result":"has no chance"}');              
                 } 
              })
                            
              this.step(function(){
                  var activity = {};
                  activity.aid = seed.aid;
                  activity.code = shake.aid;
                  activity.uid = seed.uid;
                  activity.name = shake.name;
                  activity.QTY = shake.lottery[0].QTY;          
                  activity.createDate = new Date().getTime();
                  if(Math.floor(Math.random()*100+1) <= shake.lottery[0].lottery_chance){
		                middleware.request('Coupon/FetchCoupon',{
		                  openid:seed.uid,
                      PROMOTION_CODE:shake.aid,
                      point:0,
                      otherPromId:seed.aid
		                },this.hold(function(err,doc){
		                  doc = eval("("+doc+")");
		                  if(doc.success == true){
		                    helper.db.coll('welab/customers').update({wechatid:seed.uid},{$addToSet:{shake:activity}},function(err,doc){
		                    })	                    
		                    helper.db.coll("shake/shake").insert(activity,function(err,doc){});		                  
		                    write_info(then,'{"result":"win"}');
		                  }else{
		                    write_info(then,'{"result":"'+doc.error+'"}');
		                  }
		                })) 
                        
                  }else{
                    helper.db.coll('shake/shake').insert(activity,function(err,doc){
                      console.log(doc)
                      console.log(err)
                    });
                    write_info(then,'{"result":"unwin"}');
                  }
              })
          }
      }
    }
}
function write_info(then,info){
    then.res.writeHead(200,{"Content-Type":"application/json"});
    then.res.write(info);
    then.res.end();
    then.terminate();
}
