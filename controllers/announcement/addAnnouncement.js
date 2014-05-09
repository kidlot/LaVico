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
                console.log("ok")
                //insert database
                helper.db.coll("lavico/announcement").insert({isOpen:true,title:inputTitle,content:inputContent,createTime:new Date().getTime()},
                    function(err,doc){
                        if(err) throw err;
                    });
                }
        }
    },
    viewIn:function(){
        $("input[name='btnSave']").click(function(){
            var jsonData={title:$("input[name='announcementTitle']").val(),content:$("#content").val()}
            $.get("/lavico/announcement/addAnnouncement:save",jsonData,
                function(data){
                    $("span[name='resultShowArea']").html("the data added successfully");
                    location.href='/lavico/announcement/announcementIndex'
                }
            );
        });

        $("input[name='btnBack']").click(function(){
            location.href="/lavico/announcement/announcementIndex";
        });
    }
}
