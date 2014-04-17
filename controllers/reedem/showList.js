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
                    this.terminate();
                }
            }))
        });

        this.step(function(memberId){
            //nut.model.memberId=memberId;
            if(memberId){
                memberId=9123084
                middleware.request('Point/'+memberId,{memberId:memberId},this.hold(function(err,result){
                        if(err) throw err;
                        console.log(result);
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
            //console.log(resultPoint[0])
            //console.log("memberId:"+resultPoint[1])
            reedemJson.point=resultPoint[0]
            helper.db.coll("lavico/reddem").find({}).toArray(this.hold(function(err,result){
                if(err) throw err;
                reedemJson.canUse=[]
                reedemJson.noCanUse=[]
                for(var i=0;i<result.length;i++){
                    if(resultPoint[0]>result[i].needScore){

                        (function(i){
                            //console.log("result[i].aid:"+result[i].aid)
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
            //console.log(reedemJson);
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
                var aid=seed.aid;//券ID
                var id=seed._id;//数据记录ID
                var needScore=seed.needScore;//所需扣积分

                //判断
                //活动时间范围判断
                
                //兑换时间频率判断
                //开关是否开关判断
                //积分判断



                this.step(function(){
                    //提交给接口
                    middleware.request('Point/Change',{
                        memberId:memberId,
                        qty:needScore-needScore-needScore
                    },this.hold(function(err,doc){
                        if(err) throw err;
                        if(doc.success){
                            console.log("接口CRM扣分成功");
                        }else{
                            console.log(doc.err);
                        }
                    }))
                });


                this.step(function(){
                    //记录数据库
                    var record={};
                    record.wechatId=wechatId;
                    record.aid=aid;
                    record.reddem_id=seed._id;
                    record.needScore=needScore;
                    record.memberId=memberId;
                    record.createTime=new Date().getTime();

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
                    //console.log(record)
                    nut.model.record=record;
                })

            }
        }

    }
}