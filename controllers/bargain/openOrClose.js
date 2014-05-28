module.exports= {
    layout: null,
    view: null,
    process: function (seed, nut) {
        var switcher=seed.switcher;
        var _id=seed._id;

        this.step(function(){
            helper.db.coll("lavico/bargain").update({"_id":helper.db.id(_id)},{$set:{"switcher":switcher}},this.hold(function(err,doc){
                if(err) throw err;
                if(doc) {
                    nut.message("操作成功",null,"success");
                }else{
                    nut.message("操作失败",null,"error");
                }
            }));
        });
    }
}