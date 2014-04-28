/*
   author:json
   desciption:announcement manager list(公告管理列表)
 */
module.exports={
    layout: "welab/Layout",
    view:"lavico/templates/announcement/announcementindex.html",
    process:function(seed,nut){
    },
    children:{
        //list area(列表区域)
        page:{
            layout: "welab/Layout",
            view: "lavico/templates/announcement/announcementList.html",
            process:function(seed,nut){
                var _page = {};
                //paging begin(分页开始)
                this.step(function(){
                    helper.db.coll("lavico/announcement").find().page(10,seed.page||1,
                        this.hold(function(err,page){
                        if(err) throw err ;
                        _page = page;
                        })
                    );
                });
                this.step(function(){
                    nut.model.page = _page || {} ;
                })
                //pagin end(分页结束)
            },
            viewIn:function(){
                $("input[name='btnDel']").click(function(){
                    var id=$(this).attr("data");
                    var jsonData={_id:id};
                    $.get("/lavico/announcement/announcementIndex:del",jsonData ,
                        function(result){
                            location.href='/lavico/announcement/announcementIndex';
                        }
                    );
                })
            }
        }
    },
    actions:{
        //click the button of close or open(单击关闭或开启按钮)
        close:{
            process:function(seed,nut){
                this.step(function(){
                    //get announcement table appoint record of the id(从ID获得公告表指定的记录)
                    helper.db.coll("lavico/announcement").findOne({_id:helper.db.id(seed._id)},
                        this.hold(function(err,doc){
                            if(err) throw err
                            return doc
                        })
                    )
                })

                this.step(function(doc){
                    if(doc){
                    //change state(修改状态)
                    helper.db.coll("lavico/announcement").update({_id:helper.db.id(seed._id)},{$set:{isOpen:!doc.isOpen}},
                        this.hold(function(err,doc){
                            nut.message("保存成功",null,'success') ;
                        }));
                    }else{
                        nut.disable=true;
                        num.write("error,please contact administrator of the website")
                    }
                })
            }
        },
        //delete data(删除功能)
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