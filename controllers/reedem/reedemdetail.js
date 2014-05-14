module.exports={
    layout: "lavico/layout",
    view:"lavico/templates/reedem/member_num19.html",
    process:function(seed,nut){
        var wxid = seed.wxid ? seed.wxid : 'undefined';
        var id = seed._id;
        nut.model.wxid = wxid;
        helper.db.coll("lavico/reddem").findOne({"_id":helper.db.id(id)},this.hold(function(err,doc){
            if(err) throw err;
            nut.model.doc = doc;
            console.log(nut.model.doc);
        }))
    }
}