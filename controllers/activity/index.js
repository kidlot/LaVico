var middleware = require('../../lib/middleware.js');
module.exports = {
    layout: "welab/Layout",
    view: "lavico/templates/activity/index.html",      
    process:function(seed,nut){
	    this.step(function(doc){	
		    //middleware.request('/lavico.middleware/Promotions',{
		    //},this.hold(function(err,doc){
		      var doc = '{"promotions":[{"PROMOTION_CODE":"1207","PROMOTION_NAME":"每满500减200","PROMOTION_DESC":"每满500减200"},{"PROMOTION_CODE":"L2013112709","PROMOTION_NAME":"无限制现金券","PROMOTION_DESC":"无限制现金券"},{"PROMOTION_CODE":"zdsc01","PROMOTION_NAME":"全场3折","PROMOTION_DESC":"店内西服全部3折"},{"PROMOTION_CODE":"CPL201312300001","PROMOTION_NAME":"秋款满500-120","PROMOTION_DESC":"秋款满500-120"},{"PROMOTION_CODE":"62","PROMOTION_NAME":"全场75折特殊商品除外","PROMOTION_DESC":"全场75折特殊商品除外"}]}';
		      doc = doc.replace(/[\n\r\t]/,'');
          var doc_json = eval('(' + doc + ')');
		      return doc_json.promotions;
		    //}))
	    });
	    this.step(function(doc){
	      var count = 0;
	      var then = this;
        for(var i=0;i<doc.length;i++){
          (function(i){
            helper.db.coll("lavico/activity").findOne({aid:doc[i].PROMOTION_CODE},then.hold(function(err,detail){
              count ++ ;
              if(detail){
                doc[i].name = detail.name;
                if(detail.start_time){
                  var start_date =   new Date(parseInt(detail.start_time));
                  var start_date_format = start_date.getFullYear()+'-'+(start_date.getMonth()+1)+'-'+start_date.getDate();                    
                  doc[i].start_time = start_date_format;
                }
                if(detail.end_time){
                  var end_date =   new Date(parseInt(detail.end_time));
                  var end_date_format = end_date.getFullYear()+'-'+(end_date.getMonth()+1)+'-'+end_date.getDate();                    
                  doc[i].end_time = end_date_format;
                }
                if(detail.time){
                  var date =   new Date(parseInt(detail.time));
                  var date_format = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate();                    
                  doc[i].end_time = date_format;
                }                    
                doc[i].total = detail.total;
                doc[i].send_num = detail.send_num;
              }else{
                helper.db.coll("lavico/activity").insert({aid:doc[i].PROMOTION_CODE},function(err,info){});
              }
              if(count == doc.length){
                return doc;
                then.terminate();
              }
            }));
          })(i);			          
        }
	    });
	    this.step(function(list){
	      nut.model.list = list;
	    });  	            
    },
    actions:{
      modify_html:{
        layout: "welab/Layout",
        view: "lavico/templates/activity/modify.html",
        process:function(seed,nut){
          this.step(function(){
            helper.db.coll('lavico/activity').findOne({aid:seed.aid},this.hold(function(err,doc){
              if(doc){
                return doc;
              }else{
              
              }
            }));
          });
          this.step(function(doc){
            if(doc.start_time){
              var start_date =   new Date(parseInt(doc.start_time));
              var start_date_format = start_date.getFullYear()+'-'+(start_date.getMonth()+1)+'-'+start_date.getDate();                    
              doc.start_date = start_date_format;
            }
            if(doc.end_time){
              var end_date =   new Date(parseInt(doc.end_time));
              var end_date_format = end_date.getFullYear()+'-'+(end_date.getMonth()+1)+'-'+end_date.getDate();                    
              doc.end_date = end_date_format;
            }          
            nut.model.activity = doc;
          });          
        },
        viewIn:function(){
          $('#start_date').datetimepicker({
              format: 'yyyy-mm-dd',
              autoclose: true,
              minView: 2
          })

          $('#end_date').datetimepicker({
              format: 'yyyy-mm-dd',
              autoclose: true,
              minView: 2,
              endDate: new Date()
          })
        }         
      },
      save: {

          process: function(seed,nut)
          {

              nut.view.disable() ;

              var postData = JSON.parse(seed.postData);

              if(postData.length == 0 ){
                  nut.message("保存失败。数据不能为空",null,'error') ;
                  return;
              }
              if(seed.aid){
                  helper.db.coll("lavico/activity").update({aid:seed.aid},{$set:postData},this.hold(function(err,doc){
                      if(err){
                          throw err;
                      }
                  }));
              }else{
                  nut.message("保存失败，缺少活动CODE",null,'success') ;
              }
              nut.message("保存成功",null,'success') ;
          }
      }
    }
}







