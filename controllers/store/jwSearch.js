var middleware = require('../../lib/middleware.js');
module.exports={
    layout: null,
    view:"lavico/templates/store/jwSearch.html",
    process:function(seed,nut){
        //获取用户的位置
        this.setp(function(){

        })


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


    }
}