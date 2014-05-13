/*
 author:json
 description:get announcement list(获取公告信息列表)
 */
module.exports={
    //view:"lavico/templates/announcement/showIndex.html",
    layout:"lavico/layout",
    view:"lavico/templates/announcement/member_num13.html",
    process:function(seed,nut){
        nut.model.wxid = seed.wxid;
        helper.db.coll("lavico/announcement").find({isOpen:true}).toArray(this.hold(function(err,doc){
            if(err) throw err;
            nut.model.docs=doc;
        }));
    },
    actions:{
        show:{
            layout:"lavico/layout",
            view:"lavico/templates/announcement/member_num14.html",
            process:function(seed,nut){
                nut.model.wxid=seed.wxid;
                helper.db.coll("lavico/announcement").findOne({_id:helper.db.id(seed._id)},this.hold(function(err,doc){
                    if(err) throw err;
                    nut.model.doc=doc;
                }));
            }
        }
    }
}