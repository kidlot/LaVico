/*
 author json
 description:(测试阶段-添加账户积分)
 */
var middleware = require('../../lib/middleware.js');//引入中间件
module.exports={
    layout: "welab/Layout",
    view:"lavico/templates/reedem/addCoin_Test.html",
    process:function(seed,nut){

    },
    actions:{
        //提交加分
        submit:{
            layout: "welab/Layout",
            view:"lavico/templates/reedem/addCoin_Test.html",
            process:function(seed,nut){
                this.step(function(){
                    //根据姓名和电话查memberId
                    helper.db.coll("welab/customers").findOne({"HaiLanMemberInfo.cardNumber":seed.cardNumber},
                        this.hold(function(err,result){
                            if(err) throw err;
                            console.log(result);
                            if(result){
                                return result.HaiLanMemberInfo.memberID
                            }
                        })
                    )
                })

                this.step(function(memberId){
                    //根据memberId调用接口给账户加分
                    var jsonData={};
                    jsonData.memberId=memberId;
                    jsonData.qty=3000;
                    jsonData.memo="测试";
                    middleware.request('Point/Change',jsonData,
                        this.hold(function(err,doc){
                            if(err) throw err;
                            console.log(doc);
                            nut.message("添加完成",null,"success")
                        })
                    )
                })
            }
        }
    },
    viewIn:function(){
        $("#addCoin").click(function(){
            var oLinkOptions = {} ;
            oLinkOptions.data = [{name:'cardNumber',value:$("#cardNumber").val()}];
            oLinkOptions.type = "POST";
            oLinkOptions.url = "/lavico/reedem/addCoin_Test:submit";
            $.request(oLinkOptions,function(err,nut){
                if(err) throw err ;
                nut.msgqueue.popup();//调用welab前台提示控件
            }) ;

        })
    }
}