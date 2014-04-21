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
                console.log(seed.postDate)
                this.step(function(){
                    helper.db.coll("welab/customers").findOne({realname:postData.realName,mobile:postData.mobile},
                        this.hold(function(err,result){
                            if(err) throw err;
                            if(result){
                                return result.HaiLanMemberInfo.memberID
                            }
                        }))
                })

                this.step(function(memberId){
                    console.log(memberId)
                    middleware.request('Point/Change',{
                        memberId:memberId,
                        qty:postDate.qty
                    },this.hold(function(err,doc){
                        write_info(this,"ok!");
                    }))
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