module.exports={
    layout:"welab/Layout",
    view:"lavico/templates/announcement/addAnnouncement.html",
    process:function(seed,nut){
    },
    actions:{
        save:{
            process:function(seed,nut){
                nut.disabled = true;
                var inputTitle=seed.title;
                var inputContent=seed.content;

                helper.db.coll("lavico/announcement").insert({isOpen:true,title:inputTitle,content:inputContent,createTime:createTime()},
                    function(err,doc){
                        if(err) throw err;
                    });
                }
        }
    },
    viewIn:function(){
        $("input[name='btnSave']").click(function(){
            $.get("/lavico/announcement/addAnnouncement:save",
                {title:$("input[name='announcementTitle']").val(),content:$("#content").val()},
                function(data){
                    $("span[name='resultShowArea']").html("数据录入成功");
                });
        });
        $("input[name='btnBack']").click(function(){
            location.href="/lavico/announcement/announcementIndex";
        });
    }
}

function createTime(){
    var d = new Date();
    var vYear = d.getFullYear();
    var vMon = d.getMonth() + 1;
    var vDay = d.getDate();
    s=vYear+"-"+(vMon<10 ? "0" + vMon : vMon)+"-"+(vDay<10 ? "0"+ vDay : vDay);
    return s;
}