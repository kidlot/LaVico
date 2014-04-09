var middleware = require('lavico/lib/middleware.js');//引入中间件
//会员明细记录
module.exports={
    layout:"welab/Layout",
    view:"lavico/templates/consumeDetail/details.html",
    process:function(seed,nut){
        data_request={}
        data_request.perPage=20;
        data_request.pageNum=seed.pageNum==""?1:seed.pageNum;

        middleware.request("/lavico.middleware/MemberSpending/"+seed.member_id,
        data_request,
        this.hold(function(err,doc){
            if(err) throw err;
            nut.model.docs=doc;
            cosole.log(doc);
        });
        );
    }
}