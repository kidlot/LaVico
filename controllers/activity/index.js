var middleware = require('../../lib/middleware.js');
module.exports = {
    layout: "welab/Layout",
    view: "lavico/templates/activity/index.html",      
    process:function(seed,nut){
      var perPage = 4;
      var pageNum = seed.page ? seed.page : 1;
	    this.step(function(doc){	
		    middleware.request('Coupon/Promotions',{
		      perPage:perPage,
          pageNum:pageNum
		    },this.hold(function(err,doc){		      
          //var doc = '{"total":9,"list":[{"PROMOTION_CODE":"L2013112709","PROMOTION_NAME":"无限制现金券","PROMOTION_DESC":"无限制现金券","row_number":1,"coupons":[{"QTY":123,"COUNT":1,"USED":1},{"QTY":50,"COUNT":500,"USED":0},{"QTY":1000,"COUNT":4,"USED":3},{"QTY":500,"COUNT":49,"USED":40},{"QTY":100,"COUNT":2,"USED":2},{"QTY":10000,"COUNT":50,"USED":50}]},{"PROMOTION_CODE":"MQL201401200001","PROMOTION_NAME":"长沙友谊满3000收500券","PROMOTION_DESC":"长沙友谊满3000收500券","row_number":2,"coupons":[{"QTY":91,"COUNT":1,"USED":0},{"QTY":500,"COUNT":1,"USED":1},{"QTY":100,"COUNT":2,"USED":2}]},{"PROMOTION_CODE":"CQA201401030002","PROMOTION_NAME":"满500抵用100","PROMOTION_DESC":"满500抵用100","row_number":3,"coupons":[{"QTY":100,"COUNT":30,"USED":7}]},{"PROMOTION_CODE":"CPL201401140001","PROMOTION_NAME":"奥德臣原价满10000减2500","PROMOTION_DESC":"奥德臣原价满10000减2500","row_number":4,"coupons":[{"QTY":90,"COUNT":1,"USED":1}]},{"PROMOTION_CODE":"CQL201404010004","PROMOTION_NAME":"贡平礼品券测试","PROMOTION_DESC":"贡平礼品券测试","row_number":5,"coupons":[{"QTY":398,"COUNT":1,"USED":0}]},{"PROMOTION_CODE":"MQL201402180001","PROMOTION_NAME":"ew","PROMOTION_DESC":"ewr","row_number":6,"coupons":[]},{"PROMOTION_CODE":"CQL201402250001","PROMOTION_NAME":"买衬衫送袜子","PROMOTION_DESC":"买衬衫送袜子","row_number":7,"coupons":[{"QTY":150,"COUNT":3,"USED":1}]},{"PROMOTION_CODE":"CQL201312230001","PROMOTION_NAME":"满400抵80券","PROMOTION_DESC":"满400抵80券","row_number":8,"coupons":[{"QTY":79,"COUNT":1,"USED":1},{"QTY":97,"COUNT":1,"USED":0},{"QTY":20,"COUNT":1,"USED":1},{"QTY":100,"COUNT":23,"USED":0}]},{"PROMOTION_CODE":"CQL201403260003","PROMOTION_NAME":"398元券仅限衬衫","PROMOTION_DESC":"398元券仅限衬衫","row_number":9,"coupons":[{"QTY":398,"COUNT":5,"USED":0}]}],"perPage":20,"pageNum":1}';

		      doc = doc.replace(/[\n\r\t]/,'');
          var doc_json = eval('(' + doc + ')');
          
          var page = {};
          page.lastPage = Math.ceil(doc_json.total/perPage);
          page.currentPage = pageNum;
          page.totalcount = doc_json.total;
          nut.model.page = page;
          
          
          if(doc_json && doc_json.list){
            return doc_json.list;
          }else{
            return {};
          }
		    }))
	    });
	    this.step(function(doc){
	      var count = 0;
	      var then = this;
        for(var i=0;i<doc.length;i++){
          (function(i){
            helper.db.coll("lavico/activity").findOne({aid:doc[i].PROMOTION_CODE},then.hold(function(err,detail){
              count ++ ;
              if(detail){
                if(detail.name){
                  doc[i].PROMOTION_NAME = detail.name;
                }
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
              return doc ? doc : {};
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
                      }else{
                          nut.message("保存成功",null,'success') ;
                      }
                  }));
              }else{
                  nut.message("保存失败，缺少活动CODE",null,'success') ;
              }
          }
      }
    }
}






