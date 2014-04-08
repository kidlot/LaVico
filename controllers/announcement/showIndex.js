module.exports={
    layout:null,
    view:"lavico/templates/announcement/showIndex.html",
    process:function(seed,nut){
        helper.db.coll("lavico/announcement").find().toArray(this.hold(function(err,doc){
            if(err) throw err;
            nut.model.docs=doc;
        }));
    }
}