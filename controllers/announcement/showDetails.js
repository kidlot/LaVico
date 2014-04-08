module.exports={
    layout:null,
    view:"lavico/templates/announcement/showDetails.html",
    process:function(seed,nut){
        helper.db.coll("lavico/announcement").findOne({_id:helper.db.id(seed._id)},this.hold(function(err,doc){
            if(err) throw err;
            nut.model.doc=doc;
        }));
    }
}