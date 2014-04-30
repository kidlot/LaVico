var middleware = require('../../lib/middleware.js');
module.exports={
    layout: null,
    view:"lavico/templates/reedem/showList.html",
    process:function(seed,nut){
        var reedemJson={};
        var then =this;

        this.step(function(){

            helper.db.coll("welab/customers").findOne({"wechatid":seed.wechatId},this.hold(function(err,result){
                if(err) throw err;

                if(result){
                    return result.HaiLanMemberInfo.memberID;
                }else{
                    write_info(then,"您的访问不对请和核查访问方式![缺少wechatId]")
                    this.terminate();
                }
            }))
        });

        this.step(function(memberId){
            //nut.model.memberId=memberId;
            if(memberId){
                //memberId=9123084
                middleware.request('Point/'+memberId,{memberId:memberId},this.hold(function(err,result){
                        if(err) throw err;

                        var resultJson=JSON.parse(result)
                        if(resultJson.point){
                           return [resultJson.point,memberId]//json数组双传值，数组格式
                        }else{
                           throw resultJson.err;
                           this.terminate();
                        }
                    })
                )
            }
        });

        this.step(function(resultPoint){

            reedemJson.point=resultPoint[0]
            helper.db.coll("lavico/reddem").find({}).toArray(this.hold(function(err,result){
                if(err) throw err;
                reedemJson.canUse=[]
                reedemJson.noCanUse=[]
                for(var i=0;i<result.length;i++){
                    if(resultPoint[0]>result[i].needScore){

                        (function(i){

                            middleware.request('Coupon/Promotions',{
                                perPage:10000,
                                pageNum:1,
                                code:result[i].aid
                            },then.hold(function(err,doc){
                                if(err) throw err;
                                if(doc){
                                    var resultJson=JSON.parse(doc)
                                    //console.log("doc:"+doc)
                                    var stillUse=resultJson.list[0].coupons[0].COUNT-resultJson.list[0].coupons[0].USED;
                                    if(stillUse>0){
                                        result[i].stillUse=stillUse
                                        result[i].memberId=resultPoint[1];
                                        result[i].wechatId=seed.wechatId
                                        reedemJson.canUse.push(result[i])
                                    }
                                }
                            }))
                        })(i)

                    }else{
                        (function(i){
                            middleware.request('Coupon/Promotions',{
                                perPage:10000,
                                pageNum:1,
                                code:result[i].aid
                            },then.hold(function(err,doc){
                                if(err) throw err;
                                if(doc){
                                    //console.log(doc)
                                    var resultJson=JSON.parse(doc)
                                    var stillUse=resultJson.list[0].coupons[0].COUNT-resultJson.list[0].coupons[0].USED;
                                    if(stillUse>0){
                                        result[i].stillUse=stillUse
                                        result[i].memberId=resultPoint[1];
                                        result[i].wechatId=seed.wechatId
                                        reedemJson.noCanUse.push(result[i])
                                    }
                                }
                            }))
                        })(i)


                    }
                }

            }))
        })
        this.step(function(){

            nut.model.reedemJson=reedemJson;
        })

    },
    actions:{
        exchange:{
            layout: null,
            view:"lavico/templates/reedem/exchangeOk.html",
            process:function(seed,nut){
                var wechatId=seed.wechatId;//微信ID
                var memberId=seed.memberId;//会员ID
                var point=seed.point;//你的总积分
                var aid=seed.aid;//券ID(PROMOTION_CODE)
                var id=seed._id;//数据记录ID
                var needScore=seed.needScore;//所需扣积分

                var t_name,QTY;



                //判断
                //活动时间范围判断
                this.step(function(){
                    helper.db.coll("lavico/reddem").findOne({_id:helper.db.id(id)},this.hold(function(err,result){
                        if(err) throw err;

                        if(result){
                            QTY=result.QTY
                            var currentTime=new Date().getTime();
                            if(currentTime<result.startDate || currentTime>result.endDate){
                                //超出
                                nut.write("<script>alert('很抱歉！此活动已经下架，请重新选择');history.back();</script>")
                                this.ternimate();
                            }else{
                                if(result.switcher=="Off" || result.switcher=="off"){
                                    nut.write("<script>alert('很抱歉！此活动关闭中，请重新选择');history.back();</script>")
                                    this.ternimate();
                                }
                            }
                        }
                    }))
                })

                this.step(function(){
                    helper.db.coll("lavico/reddem").findOne({_id:helper.db.id(id)},this.hold(function(err,result){
                        if(err)throw err;
                        if(result){
                            var lottery_cycle=result.lottery_cycle;
                            var lottery_count=result.lottery_count;
                            t_name=result.name;
                            return [lottery_cycle,lottery_count];
                        }
                    }))
                })

                var count=0;

                this.step(function(lottery){
                    var start_time;
                    var now_timestamp = new Date().getTime();
                    if(lottery[0] == '1'){ // 自然天
                        start_time = now_timestamp - ( now_timestamp % 86400000 );
                    }else if(lottery[0] == '2'){// 自然周
                        start_time = now_timestamp -86400000*(new Date().getDay()) - ( now_timestamp % 86400000 );
                    }else if(lottery[0] == '3'){//自然月
                        start_time = now_timestamp -86400000*(new Date().getDate()) - ( now_timestamp % 86400000 );
                    }else if(lottery[0] == '100'){//永久
                        start_time = 0;
                    }else{
                        write_info(then,'{"result":"something error"}');
                    }

                    helper.db.coll('lavico/exchangeRecord').count({wechatId:wechatId,aid:aid,createDate:{$gte:start_time}},
                        this.hold(function(err,doc){
                        count = doc;
                        return lottery;
                    }));

                })

                this.step(function(lottery){
                    if(count >=lottery[1]){
                        nut.view.disable();
                        write_info_text(this,"<h2 style='text-align: center;font-size: 40px'>sorry,you have not chance Please wait for the next<a href='#'>back</a></h2>");
                        this.terminate();
                    }
                })

                this.step(function(){
                    //提交给接口
                    console.log("wechatId:"+wechatId)//不删
                    //拿优惠券
                    var params={};
                    params.meno='积分兑换-'+t_name;
                    params.openid=wechatId;
                    params.otherPromId=id;
                    params.PROMOTION_CODE='CQL201312230001';//aid
                    //params.qty=QTY;
                    params.point=0-needScore;

                    middleware.request('Coupon/FetchCoupon',params,this.hold(function(err,doc){
                        if(err) throw err;
                        console.log("doc:"+doc)//不删

                        var docJson=JSON.parse(doc)
                        if(docJson.success){

                            return docJson
                        }else{

                            write_info_text(this,doc.err)
                        }
                    }))

                });

                /*
                var coupon_no="";
                this.step(function(docJson){

                    if(docJson.success){
                        //减积分
                        middleware.request('Point/Change',{
                            memberId:memberId,
                            qty:0-needScore
                        },this.hold(function(err,doc){

                            if(err) throw err;

                            var doc=JSON.parse(doc)
                            if(doc.success){
                                console.log("接口CRM扣分成功");
                                coupon_no=docJson.coupon_no;
                            }else{
                                console.log(doc.err);
                            }
                        }))
                    }
                })
                */


                this.step(function(docJson){
                    //记录数据库
                    var record={};
                    record.wechatId=wechatId;
                    record.aid=aid;
                    record.reddem_id=seed._id;
                    record.needScore=needScore;
                    record.memberId=memberId;
                    record.createDate=new Date().getTime();
                    record.name=t_name;
                    record.QTY=QTY
                    record.codeByCRM=docJson.coupon_no

                    helper.db.coll('welab/customers').update({wechatid:wechatId},{$addToSet:{reedem:record}},function(err,doc){
                    })

                    helper.db.coll("lavico/exchangeRecord").insert(record,this.hold(function(err,result){
                        if(err) throw err;
                        return record;//return只能放在hold
                    }))
                })

                this.step(function(record){
                    //券图 名称
                    helper.db.coll("lavico/reddem").findOne({_id:helper.db.id(record.reddem_id)},this.hold(function(err,result){
                        if(err) throw err;
                        if(result){
                            record.smallPic=result.smallPic;
                            record.bigPic=result.bigPic;
                            record.name=result.name;
                            return record;
                        }
                    }))
                })

                this.step(function(record){
                    //查找礼券图
                    helper.db.coll("lavico/activity").findOne({aid:record.aid},this.hold(function(err,result){
                        if(err) throw err;
                        if(result){
                            record.pic=result.pic;
                        }
                        return record;
                    }))
                })

                this.step(function(record){

                    nut.model.record=record;
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

function write_info_text(then,info){
    then.res.writeHead(200,{"Content-Type":"text/html"});
    then.res.write(info);
    then.res.end();
    then.terminate();
}