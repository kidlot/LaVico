/*
  author:json
  lastChangeDate:2014-4-25
  desciption: add announcement data(添加公告)
 */
module.exports={
    layout:"welab/Layout",
    view:"lavico/templates/announcement/addAnnouncement.html",
    process:function(seed,nut){
    },
    actions:{
        //save to database after cust submit(在用户提交后保存至数据库)
        save:{
            process:function(seed,nut){
                nut.disabled = true;//stop to view back停止视图模板的返回
                var inputTitle=seed.title;
                var inputContent=seed.content;
                //insert database
                helper.db.coll("lavico/announcement").insert({isOpen:true,title:inputTitle,content:inputContent,createTime:new Date().getTime()},
                    function(err,doc){
                        if(err) throw err;
                    });
                }
        }
    },
    viewIn:function(){
        window.save = function(){
            var content = encodeURIComponent(contentEditor.document.getBody().getHtml());
            var jsonData={title:$("input[name='announcementTitle']").val(),content:decodeURIComponent(content)}
            $.get("/lavico/announcement/addAnnouncement:save",jsonData,
                function(data){
                    $("span[name='resultShowArea']").html("the data added successfully");
                    location.href='/lavico/announcement/announcementIndex'
                }
            );
        }

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
