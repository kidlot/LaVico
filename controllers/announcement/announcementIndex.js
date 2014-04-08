module.exports={
    layout: "welab/Layout",
    view:"lavico/templates/announcement/announcementindex.html",
    process:function(seed,nut){
    },
    children:{
        page:{
            layout: "welab/Layout",
            view: "lavico/templates/announcement/announcementList.html",
            process:function(seed,nut){
                var _page = {};

                //分页开始
                this.step(function(){
                    helper.db.coll("lavico/announcement").find().page(5,seed.page||1,this.hold(function(err,page){
                        if(err) throw err ;
                        _page = page;
                        for (var i=0; i<page.docs.length; i++)
                        {

                        }
                    })) ;
                });
                this.step(function(){
                    console.log(_page);
                    nut.model.page = _page || {} ;
                })
            },
            //分页结束

            viewIn:function(){
                $("input[name='btnDel']").click(function(){
                    var id=$(this).parent().parent().find("input[name='anno_id']").val();
                    $.get("/lavico/announcement/announcementIndex:del",{_id:id} ,function(result){
                        location.href='/lavico/announcement/announcementIndex';
                    });
                });

                $("input[name='btnOpenClose']").click(function(){
                    var id=$(this).parent().parent().find("input[name='anno_id']").val();
                    if($(this).val()=="开"){
                        $(this).val("关");
                    }else{
                        $(this).val("开");
                    }
                    $.get("/lavico/announcement/announcementIndex:close",{_id:id},function(result){})
                });
            }
        }
    },
    actions:{
        close:{
            process:function(seed,nut){
                helper.db.coll("lavico/announcement").findOne({_id:helper.db.id(seed._id)},this.hold(
                   function(err,doc){
                       if(err) throw err
                       if(doc){
                           helper.db.coll("lavico/announcement").update({_id:helper.db.id(seed._id)},{$set:{isOpen:!doc.isOpen}},
                           this.hold(function(err,doc){
                           }));
                       }
                   })
            )}
        },
        del:{
            process:function(seed,nut){
                helper.db.coll("lavico/announcement").remove({_id:helper.db.id(seed._id)},this.hold(
                    function(err,doc){
                        if(err) throw err;
                    }
                ));
            }
        }
    },
    viewIn:function(){
        $("input[name='btnAdd']").click(function(){
            location.href='/lavico/announcement/addAnnouncement';
        });
        $("input[name='btnback']").click(function(){
            location.href='/welab/AppList';
        });
    }
}