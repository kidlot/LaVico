var middleware = require('../../lib/middleware.js');
module.exports = {
    layout: "lavico/member/layout",
    view: "lavico/templates/activity/shake.html",
    process:function(seed,nut){

        var wxid = seed.uid ? seed.uid : 'undefined';//uid是用户的wechatid
        var aid = seed.aid ? seed.aid : 'undefined';//摇一摇活动ID
        this.step(function(){
            if(wxid == 'undefined' || wxid == '{wxid}'){
                nut.disable();//不显示模版
                this.res.writeHead(200, { 'Content-Type': 'application/json' });
                this.res.write('{"error":"wxid_is_empty"}');
                this.res.end();
                this.terminate();
            }
        });

        this.step(function(){
            helper.db.coll('welab/customers').findOne({wechatid:wxid},this.hold(function(err,doc){
                if(!doc){
                    nut.disable();//不显示模版
                    this.res.writeHead(200, { 'Content-Type': 'application/json' });
                    this.res.write('{"error":"wxid_no_found"}');
                    this.res.end();
                    this.terminate();
                }
            }));
        });

        this.step(function(){
            if(aid == 'undefined'){
                nut.disable();//不显示模版
                this.res.writeHead(200, { 'Content-Type': 'application/json' });
                this.res.write('{"error":"aid_is_empty"}');
                this.res.end();
                this.terminate();
            }
        });
        this.step(function(){
            nut.model.uid = seed.uid;//uid是用户的wechatid
            nut.model.aid = seed.aid;//摇一摇活动ID
        });

    },
    actions:{
        shakeit: {
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
                   console.log('~~~~~~~~~~~~~~~~~');
                   console.log(doc);
                   console.log('~~~~~~~~~~~~~~~~~');
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
                    console.log(doc);
                    console.log('+++++++++++++++++');
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
                  activity.QTY = shake.QTY;
                  activity.createDate = new Date().getTime();

                  var _aid = 'CQL201404280005';//临时测试用的活动代码，实际为：shake.aid
                  console.log(Math.floor(Math.random()*100+1));
                  console.log(shake);
                  console.log(shake.lottery);
                  if(Math.floor(Math.random()*100+1) <= shake.lottery[0].lottery_chance){
                      console.log("摇一摇领取优惠券");
		                middleware.request('Coupon/FetchCoupon',{
		                    openid:seed.uid,
                            PROMOTION_CODE:_aid, //海澜CRM 活动代码，由 Promotions 接口返回
                            point:0,
                            otherPromId:seed.aid, //微信活动识别ID
                            memo:'摇一摇'
		                },this.hold(function(err,doc){
                            //console.log("摇一摇领取优惠券");
                            err&&console.log(doc);
                            doc = JSON.parse(doc);
                            console.log(doc);
                            if(doc.success == true){

                                activity.coupon_no = doc.coupon_no;//优惠券号码

                                helper.db.coll('welab/customers').update({wechatid:seed.uid},{$addToSet:{shake:activity}},function(err,doc){err&&console.log(doc);});

                                helper.db.coll("shake/shake").insert(activity,function(err,doc){err&&console.log(doc);});
                                write_info(then,'{"result":"win"}');
                            }else{
                                write_info(then,'{"result":"'+doc.error+'"}');
                            }

		                })) 
                        
                  }else{
                    helper.db.coll('shake/shake').insert(activity,function(err,doc){
                        err&&console.log(doc);
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
