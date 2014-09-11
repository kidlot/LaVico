var middleware = require('../../lib/middleware.js');//引入中间件
module.exports={
    layout: "lavico/layout",
    view:"lavico/templates/reedem/member_num16.html",
    viewIn:function(){
        /*掩藏分享按钮*/
        window.hideShareButtion.on();
    },
    process:function(seed,nut){
        var reedemJson={};
        var then =this;
        var wxid = seed.wechatId ? seed.wechatId : 'undefined';
        nut.model.wxid = wxid;
        nut.model.wechatId = seed.wechatId;
        var memberId = false;
        nut.model.isBind = true;
        nut.model.time = new Date().getTime();
        var points;//记录积分

        this.step(function(){
            helper.db.coll('welab/customers').findOne({wechatid:wxid},this.hold(function(err, doc){
                if(doc && doc.HaiLanMemberInfo && doc.HaiLanMemberInfo.memberID && doc.HaiLanMemberInfo.action=='bind'){
                    memberId =  doc.HaiLanMemberInfo.memberID;//获取会员ID
                }else{

                    reedemJson.canUse = []
                    reedemJson.noCanUse = []
                    nut.model.reedemJson=reedemJson;
                    nut.model.isBind = false;

                }
            }));

        });

        this.step(function(){
            //调用接口:获取会员积分
            //console.log("memberId:"+memberId);
            if(memberId){
                middleware.request('Point/'+memberId,{memberId:memberId},this.hold(function(err,result){
                    if(err){
                        this.res.writeHead(302, {'Location': "/lavico/member/index?wxid="+wxid});
                        this.res.end();
                    }

                    if(result){

                        var resultJson=JSON.parse(result);
                        points = resultJson.point;
                        return [resultJson.point,memberId]//json数组双传值，数组格式
                    }else{
                        points = "0";
                    }
                })
                )
            }else{
                points = "0";
            }
        });

        this.step(function(resultPoint){
            if(memberId){
                var endTime =  parseInt(new Date(createTime()+" 23:59:59").getTime());

                var startTime = parseInt(new Date(createTime()+" 00:00:00").getTime());
                var currentTime=new Date().getTime();
                //查找积分兑换表,获取所有所有兑换商品
                reedemJson.point=resultPoint[0]
                helper.db.coll("lavico/reddem").find({"switcher":"on","startDate":{"$lt":startTime},"endDate":{"$gt":endTime}}).toArray(this.hold(function(err,result){
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
                                        var stillUse
                                        if(resultJson&&resultJson.list&&resultJson.list[0]&&resultJson.list[0].TOTAL){
                                           stillUse=resultJson.list[0].TOTAL-resultJson.list[0].USED;//剩余数
                                        }
                                        //还有剩余票可用
                                        if(stillUse>0){

                                            result[i].stillUse=stillUse;
                                            result[i].memberId=resultPoint[1];
                                            result[i].wechatId=seed.wechatId;
                                            reedemJson.canUse.push(result[i]);//追加数组
                                        }
                                    }else{
                                        nut.view.disable();
                                        nut.write("<script>window.onload=function(){window.popupStyle2.on('商家没有提供可兑换券',function(event){history.back()})}</script>");
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

            }
        })

        this.step(function(){
            middleware.request('Coupon/Promotions', {
                perPage: 1000,
                pageNum: 1
            }, this.hold(function (err, doc) {
                doc = doc.replace(/[\n\r\t]/, '');
                doc_json = eval('(' + doc + ')');
                nut.model.json = JSON.stringify(doc_json);
            }))
        })

        this.step(function(){
            nut.model.point = points;
            nut.model.reedemJson=reedemJson;
            nut.model.wechatId=seed.wechatId;
        })

    },
    actions:{
        //兑换
        exchange:{
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
                var isok = true;

                this.step(function(){
                    middleware.request('Point/'+memberId,{memberId:memberId},this.hold(function(err,doc){
                        if(err){
                            this.res.writeHead(302, {'Location': "/lavico/member/index?wxid="+wxid});
                            this.res.end();
                        }
                        if(doc){
                            var result  = JSON.parse(doc);
                            if(parseInt(result.point) < parseInt(needScore)){
                                console.log(parseInt(result.point))
                                console.log(typeof (parseInt(result.point)))
                                console.log(parseInt(needScore))
                                console.log(typeof(parseInt(needScore)))
                                isok=false;
                                nut.view.disable();
                                nut.write("<script>window.onload=function(){window.popupStyle2.on('对不起,您的积分不足!',function(event){history.back()})}</script>");

                            }
                        }else{
                            isok = false;
                            nut.view.disable();
                            nut.write("<script>window.onload=function(){window.popupStyle2.on('没有查到您的积分，请联系我们',function(event){history.back()})}</script>");
                        }
                    }))
                })

//                //判断
//                //活动时间范围判断
                this.step(function(){
                    helper.db.coll("lavico/reddem").findOne({_id:helper.db.id(id)},this.hold(function(err,result){
                        if(err) throw err;
                        if(result){
                            QTY=result.QTY;//面值
                            t_name=result.name;//商品名
                            var currentTime=new Date().getTime();
                            if(currentTime<result.startDate || currentTime>result.endDate){
                                //超出
                                nut.view.disable();
                                nut.write("<script>window.onload=function(){window.popupStyle2.on('sorry很抱歉！此活动已经下架',function(event){history.back()})}</script>");
                                isok=false;
                            }else{
                                if(result.switcher=="Off" || result.switcher=="off"){
                                    nut.view.disable();
                                    nut.write("<script>window.onload=function(){window.popupStyle2.on('sorry很抱歉！此活动关闭中，请重新选择',function(event){history.back()})}</script>");
                                    isok=false;
                                }
                            }
                        }
                    }))
                })
                //是否已经兑换过
                /*
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
                */

                this.step(function(){

                    //提交给接口
                    //拿优惠券
                    var params={};
                    params.meno='积分兑换-'+t_name;
                    params.openid=wechatId;
                    params.otherPromId=id;
                    params.PROMOTION_CODE=aid;
                    params.point=0;
                    //调用接口：提交扣除积分和兑换奖券
                    //扣积分接口

                    if(isok){
                        //得券
                        middleware.request('Coupon/FetchCoupon',params,this.hold(function(err,doc){
                            if(err) throw err;
                            //console.log("doc:"+doc)//不删
                            var docJson=JSON.parse(doc)
                            return docJson
                            if(docJson.success){
                                //扣除积分
                                //返回true，表成功兑换，返回券值
                                return docJson

                            }else{
                                nut.view.disable();
                                nut.write("<script>window.onload=function(){window.popupStyle2.on('sorry很抱歉！此商品暂停兑换',function(event){history.back()})}</script>");
                            }
                        }))
                    }
                });

                this.step(function(docJson){
                    if(isok){
                        console.log("docJson",docJson)
                        //把兑换记录，记录至数据库
                        if(docJson.success){

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

                            middleware.request("Point/Change",
                                {"memberId": memberId, "qty": (0-needScore), "memo": '积分兑换-'+t_name},
                                this.hold(function (err, doc) {
                                }))
                            //记录会员表
                            helper.db.coll('welab/customers').update({"wechatid":wechatId,"HaiLanMemberInfo.memberID":parseInt(memberId)},{$addToSet:{reedem:record}},function(err,doc){
                            })
                            //记录兑换表
                            helper.db.coll("lavico/exchangeRecord").insert(record,this.hold(function(err,result){
                                if(err) throw err;
                                return record;//return只能放在hold
                            }))
                        }else{
                            nut.view.disable();
                            nut.write("<script>window.onload=function(){window.popupStyle2.on('"+docJson.error+"'"+",function(event){history.back()})}</script>");
                        }
                    }
                })

                this.step(function(record){
                    //根据券号，查找券名和大小图片
                    if(record){
                        helper.db.coll("lavico/reddem").findOne({_id:helper.db.id(record.reddem_id)},this.hold(function(err,result){
                            if(err) throw err;
                            if(result){

                                record.smallPic=result.smallPic;
                                record.bigPic=result.bigPic;
                                record.name=result.name;
                                return record;
                            }else{
                                nut.view.disable();
                                nut.write("<script>window.onload=function(){window.popupStyle2.on('找不到对应的兑换商品',function(event){history.back()})}</script>");
                            }
                        }))
                    }
                })

                this.step(function(record){
                    //查找礼券图
                    if(record){
                        helper.db.coll("lavico/activity").findOne({aid:record.aid},this.hold(function(err,result){
                            if(err) throw err;
                            if(result){

                                record.pic=result.pic;
                            }
                            return record;
                        }))
                    }
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