module.exports = {
    layout: "welab/Layout",
    view: "lavico/templates/users/updateuser.html",
    process: function (seed, nut) {
        this.step(function(){
            helper.db.coll("ocuser/users").findOne({_id:helper.db.id(seed._id)},this.hold(
                function(err,doc){
                    if(err) throw err
                    console.log("doc",doc)
                    nut.model.users = doc || {};
                    nut.model.json = JSON.stringify(doc);
                })
            )
        })
    },
    actions:{
        update:{
            process:function(seed,nut){
                var postData = JSON.parse(seed.postData);
                console.log("postdata",postData)
                postData.password = encryptPassword(postData.password,postData)
                var id = seed.id;
                this.step(function(){
                    helper.db.coll("ocuser/users").update({_id:helper.db.id(id)}, {$set:{"nickname":postData.nickname,"password":postData.password}}, {multi: false, upsert: true}, this.hold(function (err, doc) {
                        if (err) {
                            throw err;
                        }
                        if (doc){
                            nut.message("保存成功", null, 'success');
                        }else{
                            nut.message("保存失败", null, 'error');
                        }
                    }));
                })

            }
        }
    }
}
function encryptPassword(password,userDoc){
    return helper.util.md5(helper.util.md5(password) + userDoc.username + userDoc.createTime ) ;
}