/*
 author:json
 description:get announcement list(获取公告信息列表)
 */
module.exports={
    layout:null,
    //view:"lavico/templates/announcement/showIndex.html",
    view:"lavico/templates/announcement/member_num13.html",
    process:function(seed,nut){
        helper.db.coll("lavico/announcement").find().toArray(this.hold(function(err,doc){
            if(err) throw err;
            nut.model.docs=doc;
        }));
    },
    actions:{
        //details announcement from db by id(根据ID从数据库获取详细公告信息)
        show:{
            layout:null,
            //view:"lavico/templates/announcement/showDetails.html",
            view:"lavico/templates/announcement/member_num14.html",
            process:function(seed,nut){
                helper.db.coll("lavico/announcement").findOne({_id:helper.db.id(seed._id)},this.hold(function(err,doc){
                    if(err) throw err;
                    nut.model.doc=doc;
                }));
            }
        }
    }
}