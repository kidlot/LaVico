module.exports={
    layout:"welab/Layout",
    view:"lavico/templates/announcement/updateAnnouncement.html",
    process:function(seed,nut){
        helper.db.coll("lavico/announcement").findOne({_id:helper.db.id(seed.id)},function(err,doc){
            if(err) throw err;
            if(doc) nut.model.doc=doc;
        });
    },
    actions:{
        save:{
            process:function(seed,nut){
                helper.db.coll("lavico/announcement").update({_id:helper.db.id(seed._id)},{$set:{title:seed.title,content:seed.content}},
                    this.hold(function(err,doc){
                    }));

                var doc={};
                doc._id=seed._id;
                doc.title=seed.title;
                doc.content=seed.content;
                nut.model.doc=doc;
            }
        }
    },
    viewIn:function(){
        $("input[name=btnSave]").click(function(){
            $.get("/lavico/announcement/updateAnnouncement:save",
                {title:$("input[name='announcementTitle']").val(),content:$("#content").val(),_id:$("input[name='id']").val()},
                function(data){
                    $("span[name='resultShowArea']").html("数据修改成功");
                });
        });
        $("input[name='btnBack']").click(function(){
            location.href="/lavico/announcement/announcementIndex";
        })
    }
}