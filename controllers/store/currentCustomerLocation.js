var middleware = require('../../lib/middleware.js');
module.exports={
<<<<<<< HEAD
    layout:null,
    //view:"lavico/templates/store/currentCustomerLocation2.html",
=======
    layout:"lavico/layout",
>>>>>>> 18f127958bc0295bac132db7e8734f74b365e698
    view:"lavico/templates/store/store_num2.html",
    process:function(seed,nut){
        //接口读取门店列表(设置1000代表每页条数，即一次性全部返回)
        this.step(function(){
            var jsonData={}
            jsonData.perPage=1000;
            jsonData.pageNum=1;
            //接口返回的doc都是字符串
            middleware.request('Shops',jsonData,
                this.hold(function(err,doc){
                    if(err) throw err;
                    return JSON.parse(doc);//注意字符串和对象格式
                })
            )
        })

        var list1=[];
        this.step(function(doc){
            var cityName="上海";
            for(var i=0;i<doc.list.length;i++){
                if(doc.list[i].CITY==cityName){

                    list1.push(doc.list[i]);

                }
            }
            nut.model.city_docs=list1;
            nut.model.currentCityName=seed.city;
        })
    }

}
