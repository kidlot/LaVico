/*
    author:json
    description:change announcement(修改公告)
 */
module.exports={
    layout:"welab/Layout",
    view:"lavico/templates/announcement/updateAnnouncement.html",
    process:function(seed,nut){
        //get a announcement by id(根据ID获取公告)
        helper.db.coll("lavico/announcement").findOne({_id:helper.db.id(seed.id)},function(err,doc){
            if(err) throw err;
            if(doc){

                nut.model.doc=doc;
            };
        });
    },
    actions:{
        //change title and content by id(根据ID修改标题和内容)
        save:{
            process:function(seed,nut){

                var doc={};
                doc._id=seed._id;
                doc.title=seed.title;
                doc.content=seed.content;
                nut.model.doc=doc;

                helper.db.coll("lavico/announcement").update({_id:helper.db.id(seed._id)},{$set:{title:seed.title,content:seed.content}},
                    this.hold(function(err,doc){
                        nut.message("数据修改成功",null,"success");
                    })
                );
            }
        }
    },
    viewIn:function(){
        $("input[name=btnSave]").click(function(){
            //request-ajax submit
            var oLinkOptions = {} ;
            oLinkOptions.data = [{name:'title',value:$("input[name='announcementTitle']").val()},
                                 {name:"content",value:$("#content").val()},
                                 {name:"_id",value:$("input[name='id']").val()}];
            oLinkOptions.type = "POST";
            oLinkOptions.url = "lavico/announcement/updateAnnouncement:save";
            $.request(oLinkOptions,function(err,nut){
                if(err) throw err ;
                nut.msgqueue.popup();//调用welab前台提示控件
            }) ;
        });

        $("input[name='btnBack']").click(function(){
            location.href="/lavico/announcement/announcementIndex";
        })
    }
}