/*
 author:json
 description:(显示会员消费记录详细信息表)
 */
//引入中间件
var middleware = require('lavico/lib/middleware.js');
module.exports={
    //view:"lavico/templates/consumeDetail/details.html",
    layout:"lavico/layout",
    view:"lavico/templates/consumeDetail/member_num28.html",
    process:function(seed,nut){
        var data_request={};
        data_request.perPage=20;
        nut.model.wechatId = seed.wechatId;
        var num=typeof(seed.pageNum) == "undefined"?1:seed.pageNum;
        data_request.pageNum=num;
        var arr=[];//返回数组
        var moneyAll= 0;//每年消费额
        var saleAllMoney=0;//总消费额
        var member;

        //根据微信ID获取memberID
        this.step(function(){
            helper.db.coll("welab/customers").findOne({wechatid:seed.wechatId},this.hold(function(err,result){
                if(err) throw err;
                member=result.HaiLanMemberInfo.memberID
                //member=9123084;//测试帐号
            }))
        })

        //调接口完成返回消费记录
        this.step(function(){
            middleware.request("Member/Spending/"+member,data_request,
                this.hold(function(err,doc){
                    //console.log("doc:"+doc)
                    if(err) throw err
                    var docsJson=JSON.parse(doc)

                    for(var i in docsJson.log){
                        var yearAll={}
                        //从消费记录中获取年份
                        var year= new Date(docsJson.log[i].date).getFullYear()
                        //货币的累加(每年消费额)
                        moneyAll=moneyAll+docsJson.log[i].AMT
                        //消费总金额
                        saleAllMoney=saleAllMoney+docsJson.log[i].AMT

                        if(arr.length==0){
                            //第一次操作
                            var yearJ={};
                            yearJ.year=year;
                            yearJ.moneyAll=moneyAll;
                            yearJ.val=[];
                            yearJ.val.push(docsJson.log[i]);
                            arr.push(yearJ);
                        }else{
                            //追加
                            for(var j=0;j<arr.length;j++){
                                if(arr[j].year==year){
                                    arr[j].val.push(docsJson.log[i]);
                                    arr[j].moneyAll=moneyAll;
                                }else{
                                    var yearJ={};
                                    yearJ.year=year;
                                    yearJ.moneyAll=moneyAll;
                                    yearJ.val=[];
                                    yearJ.val.push(docsJson.log[i]);
                                    arr.push(yearJ);
                                }
                            }
                        }

                    }
                })
            )
        })


        this.step(function(){

            console.log(JSON.stringify(arr));
            nut.model.arr=arr;
            nut.model.saleAllMoney=saleAllMoney;
        })


    }
}