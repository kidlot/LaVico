module.exports = {
    layout: "welab/Layout",
    view: "lavico/templates/tags/addTag.html",
    process: function (seed, nut) {

    },
    actions:{
        insert:{
            process:function(seed,nut){
                nut.view.disable();
                var postData = JSON.parse(seed.postData);

                if(postData.length == 0 ){
                    nut.message("保存失败。数据不能为空",null,'error') ;
                    return;
                }

                helper.db.coll("lavico/tags").insert(postData,this.hold(function(err,doc){
                    if(err){
                        throw err;
                    }else{
                        nut.message("保存成功",null,'success') ;
                    }
                }))
            }
        }
    }
}
