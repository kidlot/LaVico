var middleware = require('lavico/lib/middleware.js');//引入中间件
module.exports = {
    layout: "welab/Layout",
    view: "lavico/templates/tags/Taglist.html",
    process: function (seed, nut) {

    },
    children:{
        page:{
            layout:"welab/Layout",
            view:"lavico/templates/tags/Tagpage.html",
            process:function(seed,nut){
                var tagslist = [];
                this.step(function(){
                    helper.db.coll("lavico/tags").find({}).sort({createTime:-1}).toArray(this.hold(function(err,docs){
                        if(err) throw  err;
                        if(docs){
                            tagslist = docs || {};
                        }
                    }))
                })

                this.step(function(){
                    pageSize=10
                    var data=[];
                    page={}
                    page.lastPage=tagslist.length%pageSize==0 ? parseInt(tagslist.length/pageSize) : parseInt(tagslist.length/pageSize)+1;
                    page.currentPage=typeof(seed.page)=="undefined"?1:parseInt(seed.page);
                    page.totalCount=tagslist.length

                    for(var j=(page.currentPage-1)*pageSize;j<(page.currentPage-1)*pageSize+pageSize;j++){
                        if(typeof(tagslist[j])!="undefined")
                            data.push(tagslist[j])
                    }

                    for(var i=0;i<data.length; i++){
                        data[i].createTime = formatTime(data[i].createTime);
                    }

                    nut.model.data = data;
                    nut.model.page=page || {};
                })
            }
        }
    },
    actions:{
        del:{
            process:function(seed,nut){
                var id = seed.id;
                var tag;//标签名
                var userlist=[];//所有用户
                var stutas=[];//记录删除标签的返回状态

                var errID = [];
                var successID = [];
                this.step(function(){
                    helper.db.coll("lavico/tags").findOne({_id:helper.db.id(id)},this.hold(
                        function(err,doc){
                            if(err) throw err
                            tag = doc || {};
                        })
                    )
                })

                this.step(function(){
                    if(tag && tag.title){
                        if(tag.title.indexOf("型男测试")>=0){
                            tag.title = tag.title+" ";
                        }
                        helper.db.coll("welab/customers").find({ tags: tag.title}).toArray(this.hold(function(err,docs){
                            if(err) throw  err;
                            if(docs){
                                for(var i=0;i<docs.length;i++){
                                    if(docs[i].HaiLanMemberInfo && docs[i].HaiLanMemberInfo.memberID){
                                        var user={};
                                        user.id = docs[i]._id;
                                        user.wxid = docs[i].wechatid;
                                        user.memberID =docs[i].HaiLanMemberInfo.memberID;
                                        user.tags = docs[i].tags;
                                        userlist.push(user);
                                    }
                                }
                            }
                        }))
                    }
                })

                this.step(function(){
                    this.each(userlist,function(i,row){
                        if(row.memberID){
                            middleware.request("Tag/Remove", {memberId: row.memberID,tag: tag.title}, this.hold(function (err, doc) {
                                if (err) {
                                    console.log(err)
                                }
                                var docs = JSON.parse(doc);
                                row.status = docs.success;
                                sta={};
                                sta.stat = docs.success;
                                sta.id = row.id;
                                sta.wxid = row.wxid;
                                stutas.push(sta);
                            }))
                        }
                    })
                })

                this.step(function(){
                    for(var i=0;i<stutas.length;i++){
                        if(stutas[i].stat == true){
                            helper.db.coll("welab/customers").update({_id : helper.db.id(stutas[i].id)}, {"$pull":{tags:tag.title}},this.hold(function(err,doc){
                                if(err){
                                    throw err;
                                }
                            }))
                        }
                    }
                })

                this.step(function(){
                    for(var j=0;j<stutas.length;j++){
                        if(stutas[j].stat==false){
                            errID.push(stutas[j].id);
                        }else{
                            successID.push(stutas[j].id);
                        }
                    }
                })


                this.step(function(){
                    if(errID.length>0){
                        nut.message("共为"+stutas.length+"个用户删除标签,"+successID.length+"个标签删除成功,"+ errID.length+"个标签删除失败",null,'error') ;
                    }else{
                        helper.db.coll("lavico/tags").remove({_id:helper.db.id(seed.id)},this.hold(function(err,doc){
                            if(err) throw err;
                            if(doc){
                                nut.message("删除成功",null,'success');
                            }else{
                                nut.message("删除失败",null,'error');
                            }
                        }));
                    }
                })
            }
        }
    }
}
function   formatTime(now){
    var   now = new Date(now);
    var   year=now.getFullYear();
    var   month=(now.getMonth()+1>9)?(now.getMonth()+1):('0'+(now.getMonth()+1));
    var   date=(now.getDate()>9)?now.getDate():('0'+now.getDate());
    var   hour=(now.getHours()>9)?now.getHours():('0'+now.getHours());
    var   minute=(now.getMinutes()>9)?now.getMinutes():('0'+now.getMinutes());
    var   second=(now.getSeconds()>9)?now.getSeconds():('0'+now.getSeconds());
    return   year+"-"+month+"-"+date;
}
