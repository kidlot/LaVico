var middleware = require('../../lib/middleware.js');//引入中间件
module.exports={
    layout: "lavico/layout",
    view:"lavico/templates/reedem/member_num16.html",
    process:function(seed,nut){
        var reedemJson={};
        var then =this;
        var wxid = seed.wechatId ? seed.wechatId : 'undefined';
        nut.model.wxid = wxid;

        this.step(function(){
            helper.db.coll('welab/customers').findOne({wechatid:wxid},this.hold(function(err, doc){
                if(doc && doc.HaiLanMemberInfo && doc.HaiLanMemberInfo.memberID && doc.HaiLanMemberInfo.action=='bind'){
                    return doc.HaiLanMemberInfo.memberID;//获取会员ID
                }else{
                    nut.disable();//不显示模版
                    this.res.writeHead(200,{'Content-Type':'text/html;charset=utf-8'})
                    this.res.write("<script>alert('请先申请会员卡或者绑定会员,然后参加活动!');window.location.href='/lavico/member/index?wxid="+wxid+"'</script>");
                    this.res.end();
                    this.terminate();
                }
            }));

        });

        this.step(function(memberId){
            //调用接口:获取会员积分
            //console.log("memberId:"+memberId);
            if(memberId){
                middleware.request('Point/'+memberId,{memberId:memberId},this.hold(function(err,result){
                    if(err){
                        this.res.writeHead(302, {'Location': "/lavico/member/index?wxid="+wxid});
                        this.res.end();
                    }
                    //console.log("会员积分err:"+err);
                    //console.log("会员积分:"+result);
                    if(result){
                        var resultJson=JSON.parse(result);
                        return [resultJson.point,memberId]//json数组双传值，数组格式
                    }else{
                        nut.disable();
                        write_info(then,"没有查到您的积分，请联系我们");
                    }
                })
                )
            }
        });

        this.step(function(resultPoint){
            //查找积分兑换表,获取所有所有兑换商品
            reedemJson.point=resultPoint[0]
            helper.db.coll("lavico/reddem").find({}).toArray(this.hold(function(err,result){
                if(err) throw err;
                reedemJson.canUse=[];//可兑换商品数组
                reedemJson.noCanUse=[];//不可兑换商品数组
                for(var i=0;i<result.length;i++){
                    if(resultPoint[0]>=result[i].needScore){
                        //调用接口：查找所有可兑换券
                        (function(i){
                            middleware.request('Coupon/Promotions',{
                                perPage:10000,
                                pageNum:1,
                                code:result[i].aid
                            },then.hold(function(err,doc){
                                if(err) throw err;
                                if(doc){
                                    var resultJson=JSON.parse(doc)
                                    var stillUse=resultJson.list[0].TOTAL-resultJson.list[0].USED;//剩余数
                                    //还有剩余票可用
                                    if(stillUse>0){
                                        //console.log("asdasdsa:"+resultPoint);
                                        result[i].stillUse=stillUse;
                                        result[i].memberId=resultPoint[1];
                                        result[i].wechatId=seed.wechatId;
                                        reedemJson.canUse.push(result[i]);//追加数组
                                    }
                                }else{
                                    nut.disable();
                                    write_info_text(then,"商家没有提供可兑换券");
                                }
                            }))
                        })(i)
                    }else{
                        //调用接口：查找所有券
                        (function(i){
                            middleware.request('Coupon/Promotions',{
                                perPage:10000,
                                pageNum:1,
                                code:result[i].aid
                            },then.hold(function(err,doc){
                                if(err) throw err;
                                if(doc){
                                    var resultJson=JSON.parse(doc)
                                    var stillUse=resultJson.list[0].TOTAL-resultJson.list[0].USED;
                                    if(stillUse>0){
                                        result[i].stillUse=stillUse;
                                        result[i].memberId=resultPoint[1];
                                        result[i].wechatId=seed.wechatId;
                                        reedemJson.noCanUse.push(result[i]);//分数过大的追加不可兑换数组
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
            nut.model.wechatId=seed.wechatId;
        })

    },
    actions:{
        //兑换
        exchange:{
            //view:"lavico/templates/reedem/exchangeOk.html",
            layout: "lavico/layout",
            view:"lavico/templates/reedem/member_num17.html",
            process:function(seed,nut){
                var wechatId=seed.wechatId;//微信ID
                var memberId=seed.memberId;//会员ID
                var point=seed.point;//你的总积分
                var aid=seed.aid;//券ID(PROMOTION_CODE)
                var id=seed._id;//数据记录ID
                var needScore=seed.needScore;//所需扣积分
                var then=this;
                var t_name,QTY;

                //判断
                //活动时间范围判断
                this.step(function(){
                    helper.db.coll("lavico/reddem").findOne({_id:helper.db.id(id)},this.hold(function(err,result){
                        if(err) throw err;
                        if(result){
                            QTY=result.QTY;//面值
                            t_name=result.name;//商品名
                            var currentTime=new Date().getTime();
                            if(currentTime<result.startDate || currentTime>result.endDate){
                                //超出
                                nut.disable();
                                write_info_text(then,'sorry很抱歉！此活动已经下架');
                            }else{
                                if(result.switcher=="Off" || result.switcher=="off"){
                                    nut.disable();//不返回模板
                                    write_info_text(then,'sorry很抱歉！此活动关闭中，请重新选择');
                                }
                            }
                        }
                    }))
                })
                //是否已经兑换过
                this.step(function(){
                    var jsonData={};
                    jsonData.wechatId=wechatId;
                    jsonData.aid=aid;
                    jsonData.reddem_id=seed._id;
                    helper.db.coll("lavico/exchangeRecord").findOne(jsonData,
                        this.hold(function(err,result){
                            if(err)throw err;
                            if(result){
                                nut.disable();//不返回模板
                                //write_info_text(then,'sorry很抱歉！很抱歉您已经兑换过此商品');
                                write_info_txt(then,'sorry很抱歉！很抱歉您已经兑换过此商品');
                            }
                        })
                    )
                })

                this.step(function(){
                    //提交给接口
                    //console.log("wechatId:"+wechatId)//不删
                    //拿优惠券
                    var params={};
                    params.meno='积分兑换-'+t_name;
                    params.openid=wechatId;
                    params.otherPromId=id;
                    params.PROMOTION_CODE=aid;
                    //params.PROMOTION_CODE='CQL201404280005';//aid:测试号
                    params.point=0-needScore;
                    //调用接口：提交扣除积分和兑换奖券
                    middleware.request('Coupon/FetchCoupon',params,this.hold(function(err,doc){
                        if(err) throw err;

                        //console.log("doc:"+doc)//不删

                        var docJson=JSON.parse(doc)
                        if(docJson.success){
                            //返回true，表成功兑换，返回券值
                            return docJson
                        }else{
                            nut.disable();
                            write_info_text(then,'sorry很抱歉！此商品暂停兑换');
                        }
                    }))
                });

                this.step(function(docJson){
                    //把兑换记录，记录至数据库
                    if(docJson){

                        var record={};
                        record.wechatId=wechatId;
                        record.aid=aid;//p_code
                        record.reddem_id=seed._id;
                        record.needScore=needScore;
                        record.memberId=memberId;
                        record.createDate=new Date().getTime();
                        record.name=t_name;
                        record.QTY=QTY;
                        record.codeByCRM=docJson.coupon_no;//接口返回的券号
                        //记录会员表
                        helper.db.coll('welab/customers').update({wechatid:wechatId},{$addToSet:{reedem:record}},function(err,doc){
                        })
                        //记录兑换表
                        helper.db.coll("lavico/exchangeRecord").insert(record,this.hold(function(err,result){
                            if(err) throw err;
                            return record;//return只能放在hold
                        }))
                    }else{

                        nut.disable();
                        write_info_text(then,'数据错误1');
                    }
                })

                this.step(function(record){
                    //根据券号，查找券名和大小图片
                    helper.db.coll("lavico/reddem").findOne({_id:helper.db.id(record.reddem_id)},this.hold(function(err,result){
                        if(err) throw err;
                        if(result){

                            record.smallPic=result.smallPic;
                            record.bigPic=result.bigPic;
                            record.name=result.name;
                            return record;
                        }else{

                            nut.disable();
                            write_info_text(then,'数据错误2');


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
                    nut.model.wechatId=wechatId;
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

function write_info_txt(then,info){
    //console.log(info)
    then.res.writeHead(200,{"Content-Type":"text/plain;charset=utf-8"});
    then.res.write(info);
    then.res.end();
    then.terminate();
}

function write_info_text(then,info){
    then.res.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
    then.res.write(info);
    then.res.end();
    then.terminate();
}