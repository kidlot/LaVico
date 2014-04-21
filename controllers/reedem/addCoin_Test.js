var middleware = require('../../lib/middleware.js');
module.exports={
    layout: "welab/Layout",
    view:"lavico/templates/reedem/addCoin_Test.html",
    process:function(seed,nut){

    },
    actions:{
        submit:{
            layout: "welab/Layout",
            view:"lavico/templates/reedem/addCoin_Test.html",
            process:function(seed,nut){
                nut.view.disable();
                postDate=JSON.parse(seed.postDate)
                middleware.request('Point/Change',{
                    memberId:postDate.memberId,
                    qty:postDate.qty
                },this.hold(function(err,doc){
                    //if(doc.success)
                        //nut.message("保存成功",null,'success') ;
                }))
            }
        }
    }
}