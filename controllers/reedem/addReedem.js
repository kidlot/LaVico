var middleware = require('../../lib/middleware.js');
module.exports={
    layout: "welab/Layout",
    view:"lavico/templates/reedem/addReedem.html",
    process:function(seed,nut){
        var perPage = 1000;
        var pageNum = seed.page ? seed.page : 1;

        var then = this;
        //Coupon/Promotions:券表
        this.step(function(doc){
            middleware.request('Coupon/Promotions',{
                perPage:perPage,
                pageNum:pageNum
            },this.hold(function(err,doc){
                console.log("doc:"+doc)
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
        //lavico/activity:接口：活动表
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
                                        doc[i].coupons[j].introduction=detail.coupons[k].introduction
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
        this.step(function(list){
            //console.log(list)
            //doc = JSON.stringify(list);
            nut.model.list = list;
        });
    },
    actions:{
        save:{
            layout: "welab/Layout",
            view:"lavico/templates/reedem/updateReedem.html",
            process:function(seed,nut){
                helper.db.coll("lavico/reddem").update({_id:helper.db.id(seed._id)},postData,{multi:false,upsert:true},this.hold(function(err,doc){
                    if(err){
                        throw err;
                    }else{
                        nut.message("保存成功",null,'success') ;
                    }
                }));
            }
        },

        modify_html:{
            layout: "welab/Layout",
            view:"lavico/templates/reedem/updateReedem.html",
            process:function(seed,nut){
                var perPage = 1000;
                var pageNum = seed.page ? seed.page : 1;
                var then = this;
                //Coupon/Promotions:券表
                this.step(function(doc){
                    middleware.request('Coupon/Promotions',{
                        perPage:perPage,
                        pageNum:pageNum
                    },this.hold(function(err,doc){
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
                //lavico/activity:接口：活动表
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
                                                doc[i].coupons[j].introduction=detail.coupons[k].introduction
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
                var redem
                this.step(function(){
                    if(seed._id){
                        helper.db.coll("lavico/reddem").findOne({_id:helper.db.id(seed._id)},then.hold(function(err,reedem){
                            if(reedem){
                                redem = reedem;
                            }
                        }));
                    }
                })

                this.step(function(){
                    nut.model.list = list;//全部券名
                    nut.model.reedem = redem;//
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


                if($("#aid").val()){
                    aid = $("#aid").val();
                    $("#activity_select option").each(function(){ if($(this).val() == aid){ $(this).attr("selected","true");
                    } $(".promotion_detail").css('display','none');
                        $("#"+aid).css('display','block');
                        $("#"+aid+" .needScore").val($('#needScore').val());
                    });
                }
                var lottery_input = $("#lottery_input").val();
                if(lottery_input){ $("#lottery_cycle option").each(function(){
                    if($(this).val() == lottery_input){
                        $(this).attr("selected","true");
                } }); }
                $('#activity_select').change(function(){ aid = $(this).val();
                    $(".promotion_detail").css('display','none');
                    $("#"+$(this).val()).css('display','block');
                });
            }
        },
        update:{

            process:function(seed,nut){
                nut.view.disable();
                var postData = JSON.parse(seed.postData);
                console.log(seed.postData)
                if(postData.length == 0 ){
                    nut.message("保存失败。数据不能为空",null,'error') ;
                    return;
                }


                helper.db.coll("lavico/reddem").insert(postData,this.hold(function(err,doc){
                    if(err){
                        throw err;
                    }else{
                        nut.message("保存成功",null,'success') ;
                    }
                }))

                /*
                helper.db.coll("lavico/reddem").update({_id:helper.db.id(seed._id)},postData,{multi:false,upsert:true},this.hold(function(err,doc){
                    if(err){
                        throw err;
                    }else{
                        nut.message("保存成功",null,'success') ;
                    }
                }));
                 */

            }
        }
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

}