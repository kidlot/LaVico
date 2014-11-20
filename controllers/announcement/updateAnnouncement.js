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
                nut.model.id=seed.id;
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

                helper.db.coll("lavico/announcement").update({_id:helper.db.id(seed._id)},{$set:{title:seed.title,content:seed.content,createTime:new Date().getTime()}},
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
            var content = encodeURIComponent(contentEditor.document.getBody().getHtml());
            var jsonData={title:$("input[name='announcementTitle']").val(),content:decodeURIComponent(content)}
            var oLinkOptions = {} ;
            oLinkOptions.data = [{name:'title',value:$("input[name='announcementTitle']").val()},
                                 {name:"content",value:content},
                                 {name:"_id",value:$("#announcementId").val()}];
            oLinkOptions.type = "POST";
            oLinkOptions.url = "lavico/announcement/updateAnnouncement:save";
            $.request(oLinkOptions,function(err,nut){
                if(err) throw err ;
                nut.msgqueue.popup();//调用welab前台提示控件
                location.href='/lavico/announcement/announcementIndex'
            }) ;
        });

        $("input[name='btnBack']").click(function(){
            location.href="/lavico/announcement/announcementIndex";
        })

        //正文内容-编辑器
        var contentEditor = CKEDITOR.replace( 'content', {
            toolbar: [
                [ 'Source','Image','Bold', 'Italic', '-', 'NumberedList', 'BulletedList', '-', 'Link', 'Unlink']
            ]
        });
        contentEditor.config.shiftEnterMode = CKEDITOR.ENTER_BR;
        contentEditor.config.enterMode = CKEDITOR.ENTER_BR;
        contentEditor.config.language = 'zh-cn';
        contentEditor.config.width = 600;
        contentEditor.config.height = 400;
        contentEditor.config.allowedContent = true;//防止过滤标签的css-style属性
    }
}