var middleware = require('../../lib/middleware.js');
module.exports={
    layout: "welab/Layout",
    view:"lavico/templates/reedem/reedem_list.html",
    process:function(seed,nut){

        var perPage = 10;
        var pageNum = seed.page ? seed.page : 1;
        var then = this;
        var startTime =  parseInt(new Date(createTime()+" 23:59:59").getTime());

        var endTime = parseInt(new Date(createTime()+" 00:00:00").getTime());

        var list = {};
        helper.db.coll("lavico/reddem").find({}).sort({createTime:-1}).page(perPage,pageNum,then.hold(function(err,page){
            if(err) throw err;
            list = page

            for (var i=0;i<page.docs.length;i++)
            {
                if(new Date().getTime() < list.docs[i].startDate){
                    list.docs[i].status = "未开始"
                }else if(endTime > list.docs[i].endDate){
                    list.docs[i].status = "已结束"
                }else{
                    if(list.docs[i].switcher=="on"){
                        list.docs[i].status = "进行中"
                    }else{
                        list.docs[i].status = "已关闭"
                    }
                }
            }
        })) ;

        this.step(function(){
            if(list && list.docs){
                for(var i=0;i<list.docs.length;i++){
                    (function(i){
                        middleware.request('Coupon/Promotions',{
                            perPage:1000,
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
        });

        this.step(function(){
            for(var i=0;i<list.docs.length;i++){
                (function(doc){
                    helper.db.coll("lavico/exchangeRecord").find({reddem_id:doc._id.toString()}).count(then.hold(function(err,result){
                        if(err) throw err;
                        if(result){
                            doc.allExchangeCount=result;
                        }else{
                            doc.allExchangeCount=0;
                        }
                    }))

                })(list.docs[i])
            }
        });

        this.step(function(){

            nut.model.list = list;
        });

    },
    actions:{
        del:{
            process:function(seed,nut){
                nut.view.disable();
                helper.db.coll("lavico/reddem").remove({_id:helper.db.id(seed._id)},this.hold(function(err,doc){
                    if(err){
                        throw err;
                    }else{
                       this.res.writeHead(301, { "Location": "/lavico/reedem/reedem_list" });
                       this.res.end();
                    }
                }))
            }
        },
        openOrClose:{
            process: function(seed,nut)
            {
                nut.view.disable() ;
                helper.db.coll("lavico/reddem").update({_id:helper.db.id(seed._id)},{$set:{switcher:seed.switcher}},this.hold(function(err,doc){
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


function   createTime(){
    var   now = new Date();
    var   year=now.getFullYear();
    var   month=(now.getMonth()+1>9)?(now.getMonth()+1):('0'+(now.getMonth()+1));
    var   date=(now.getDate()>9)?now.getDate():('0'+now.getDate());
    var   hour=(now.getHours()>9)?now.getHours():('0'+now.getHours());
    var   minute=(now.getMinutes()>9)?now.getMinutes():('0'+now.getMinutes());
    var   second=(now.getSeconds()>9)?now.getSeconds():('0'+now.getSeconds());
    return   year+"-"+month+"-"+date;
}