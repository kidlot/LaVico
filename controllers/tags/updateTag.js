module.exports = {
    layout: "welab/Layout",
    view: "lavico/templates/tags/updateTag.html",
    process: function (seed, nut) {
        var tags;
        this.step(function(){
            helper.db.coll("lavico/tags").findOne({_id:helper.db.id(seed._id)},this.hold(
                function(err,doc){
                    if(err) throw err
                    nut.model.tag = doc || {};
                })
            )
        })

        this.step(function(){
            //nut.model.tag = tags;
            console.log("nut.model.tag",nut.model.tag)
        })
    },
    actions:{
        update:{
            process:function(seed,nut){
                var title = seed.title;
                var id = seed.id;
                helper.db.coll("lavico/tags").update({_id:helper.db.id(id)}, {$set:{'title':title}}, {multi: false, upsert: true}, this.hold(function (err, doc) {
                    if (err) {
                        throw err;
                    }
                    if (doc){
                        nut.message("保存成功", null, 'success');
                    }else{
                        nut.message("保存失败", null, 'error');
                    }
                }));

            }
        }
    }
}