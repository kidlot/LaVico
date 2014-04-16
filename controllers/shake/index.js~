var middleware = require('../../lib/middleware.js');
module.exports = {
    layout: "welab/Layout",
    view: "lavico/templates/shake/index.html",      
    process:function(seed,nut){

      var perPage = 1;
      var pageNum = seed.page ? seed.page : 1;
      var then = this;

      var list = {};
      helper.db.coll("lavico/shake").find({}).sort({createTime:-1}).page(perPage,pageNum,then.hold(function(err,page){
          list = page
          for (var i=0;i<page.docs.length;i++)
          {
              if(new Date().getTime() < list.docs[i].startDate){
                  list.docs[i].status = "未开始"
              }else if(new Date().getTime() > list.docs[i].endDate){
                  list.docs[i].status = "已结束"
              }else{
                  list.docs[i].status = "进行中"
              }
          }
      })) ;


      this.step(function(){
        if(list && list.docs){
          for(var i=0;i<list.docs.length;i++){
            (function(i){
              middleware.request('Coupon/Promotions',{
                perPage:perPage,
                pageNum:1,
                code:list.docs[i].aid
              },then.hold(function(err,doc){
		            doc = doc.replace(/[\n\r\t]/,'');
                var doc_json = eval('(' + doc + ')');
                for(var o in doc_json.list[0]){
                  list.docs[i][o] = doc_json.list[0][o];
                }
              }))
            })(i);			          
          }
        }       
      })
	    this.step(function(){
	      nut.model.list = list;
	    }); 
 	            
    },
    actions:{
      modify_html:{
        layout: "welab/Layout",
        view: "lavico/templates/shake/modify.html",
        process:function(seed,nut){
          var perPage = 1000;
          var pageNum = seed.page ? seed.page : 1;
          var then = this;
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
	        var list;
	        this.step(function(doc){
	          var count = 0;
            for(var i=0;i<doc.length;i++){
              (function(i){
                helper.db.coll("lavico/activity").findOne({aid:doc[i].PROMOTION_CODE},then.hold(function(err,detail){
                  count ++ ;
                  if(detail){
                    for(var j=0;j<doc[i].coupons.length;j++){
                      for(var k=0;k<detail.coupons.length;k++){
                        if(doc[i].coupons[j].QTY == detail.coupons[k].QTY && detail.coupons[k].pic){
                          doc[i].coupons[j].pic = detail.coupons[k].pic;
                        }
                      }
                    }        
                  }
                  if(count == doc.length){
                    list = doc
                    return doc;
                    then.terminate();
                  }
                }));
              })(i);			          
            }
	        });
	        
          this.step(function(){
            if(seed._id){
              helper.db.coll("lavico/shake").findOne({_id:helper.db.id(seed._id)},then.hold(function(err,shake){
                  if(shake){
                    return shake;
                  }
              }));
            }
          })        
	        this.step(function(shake){
            shake = shake ? shake : {};
	          doc = JSON.stringify(list);
	          nut.model.list = list;
	          nut.model.shake = shake;
	          nut.model.doc = doc;
	        });           
        },
        viewIn:function(){
          $('#startDate').datetimepicker({
              format: 'yyyy-mm-dd',
              autoclose: true,
              minView: 2
          })

          $('#endDate').datetimepicker({
              format: 'yyyy-mm-dd',
              autoclose: true,
              minView: 2
          })
        }         
      },
      save: {
          layout: "welab/Layout",
          view: "lavico/templates/shake/info.html",
          process: function(seed,nut)
          {

              nut.view.disable() ;

              var postData = JSON.parse(seed.postData);

              if(postData.length == 0 ){
                  nut.message("保存失败。数据不能为空",null,'error') ;
                  return;
              }
              helper.db.coll("lavico/shake").update({_id:helper.db.id(seed._id)},postData,{multi:false,upsert:true},this.hold(function(err,doc){
                  if(err){
                      throw err;
                  }else{
                      nut.message("保存成功",null,'success') ;
                  }
              }));

          }
      },
      remove: {
          layout: "welab/Layout",
          view: "lavico/templates/shake/info.html",
          process: function(seed,nut)
          {

              nut.view.disable() ;

              helper.db.coll("lavico/shake").remove({_id:helper.db.id(seed._id)},this.hold(function(err,doc){
                  if(err){
                      throw err;
                  }else{
                      nut.message("删除成功",null,'success') ;
                  }
              }));

          }
      },      
      switcher:{
          process: function(seed,nut)
          {

              nut.view.disable() ;
                 
              helper.db.coll("lavico/shake").update({_id:helper.db.id(seed._id)},{$set:{switcher:seed.switcher}},this.hold(function(err,doc){
                  if(err){
                      throw err;
                  }else{
                      nut.message("保存成功",null,'success') ;
                  }
              }));

          }      
      },
      info:{
          process: function(seed,nut)
          {

              nut.view.disable() ;
                 
              helper.db.coll("lavico/shake").update({_id:helper.db.id(seed._id)},{$set:{switcher:seed.switcher}},this.hold(function(err,doc){
                  if(err){
                      throw err;
                  }else{
                      nut.message("保存成功",null,'success') ;
                  }
              }));

          }      
      }      
      
      
    
    }
}






