var middleware = require('lavico/lib/middleware.js');//引入中间件
//会员明细记录
module.exports={
    layout:null,
    view:"lavico/templates/consumeDetail/details.html",
    process:function(seed,nut){
        data_request={}
        data_request.perPage=20
        var num=typeof(seed.pageNum) == "undefined"?1:seed.pageNum
        data_request.pageNum=num
        var yearAll={}
        var moneyAll=0

        this.step(function(){
            middleware.request("Member/Spending/9123084",data_request,
                this.hold(function(err,doc){
                    console.log(doc)
                    if(err) throw err
                    var docsJson=JSON.parse(doc)
                    //console.log(doc)
                    for(var i in docsJson.log){
                        var year= new Date(docsJson.log[i].date).getFullYear()
                        moneyAll=moneyAll+docsJson.log[i].AMT//货币的累加
                        if(yearAll.year){
                            yearAll.val.push(docsJson.log[i])
                        }else{
                            yearAll.year=year
                            yearAll.val=[]
                            yearAll.val.push(docsJson.log[i])
                        }
                    }
                })
            )
        })

        this.step(function(){

            nut.model.yearList=yearAll
            console.log(yearAll)
            nut.model.moneyAll=moneyAll
        })


    }
}