var middleware = require('lavico/lib/middleware.js');//引入中间件
module.exports = {
    layout: "welab/Layout",
    view: "lavico/templates/tags/updateTag.html",
    process: function (seed, nut) {
        var tags;
        this.step(function(){
            helper.db.coll("lavico/tags").findOne({_id:helper.db.id(seed._id)},this.hold(
                function(err,doc){
                    if(err) throw err
                    nut.model.tag = doc || {};
                })
            )
        })

//        this.step(function(){
//            //nut.model.tag = tags;
//            console.log("nut.model.tag",nut.model.tag)
//        })
    },
    actions:{
        update:{
            process:function(seed,nut){
                nut.view.disable();
                var title = seed.title;
                var id = seed.id;
                var tag;//标签名
                var userlist=[];//所有用户
                var stutas=[];//记录删除标签的返回状态
                var addstutas=[];//记录删除标签的返回状态

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
                        helper.db.coll("welab/customers").find({ tags: tag.title }).toArray(this.hold(function(err,docs){
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
                                sta.memberID = row.memberID;
                                stutas.push(sta);
                            }))
                        }
                    })
                })

                this.step(function(){
                    this.each(stutas,function(i,row){
                        if(row.memberID && row.stat==true){
                            middleware.request("Tag/Add", {memberId: row.memberID,tag: title}, this.hold(function (err, doc) {
                                if (err) {
                                    console.log(err)
                                }
                                var docs = JSON.parse(doc);
                                row.status = docs.success;
                                sta={};
                                sta.stat = docs.success;
                                sta.id = row.id;
                                sta.wxid = row.wxid;
                                addstutas.push(sta);
                            }))
                        }else{
                            errID.push(row.id);
                        }
                    })
                })

                this.step(function(){
                    for(var i=0;i<addstutas.length;i++){
                        if(addstutas[i].stat == true){
                            helper.db.coll("welab/customers").update({_id : helper.db.id(stutas[i].id),tags: tag.title}, {$set:{"tags.$":title}},{upsert:true},this.hold(function(err,doc){
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
                        nut.message("共为"+stutas.length+"个用户修改标签,"+successID.length+"个标签修改成功,"+ errID.length+"个标签修改失败(由于该标签与郎维高CRM库内容不匹配,暂时无法修改本标签,还请检查CRM库再删除,谢谢)",null,'error') ;
                    }else{
                        helper.db.coll("lavico/tags").update({_id:helper.db.id(id)}, {$set:{'title':title}}, {multi: false, upsert: true}, this.hold(function (err, doc) {
                            if (err) {
                                throw err;
                            }
                            if (doc){
                                nut.message("保存成功", null, 'success');
                            }else{
                                nut.message("保存失败", null, 'error');
                            }
                        }));
                    }
                })
            }
        }
    }
}