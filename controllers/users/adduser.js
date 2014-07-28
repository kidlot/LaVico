module.exports = {
    layout: "welab/Layout",
    view: "lavico/templates/users/adduser.html",
    process: function (seed, nut) {

    },
    actions:{
        insert:{
            process:function(seed,nut){
                var count=0;
                nut.view.disable();
                var postData = JSON.parse(seed.postData);
                if(postData.length == 0 ){
                    nut.message("保存失败。数据不能为空",null,'error') ;
                    return;
                }
                postData.password = encryptPassword(postData.password,postData) ;

                console.log("postData_1",postData)

                this.step(function(){
                    helper.db.coll("ocuser/users").findOne({"username":postData.username},this.hold(
                        function(err,doc){
                            if(err) throw err
                            if(doc){
                                count = doc.length;
                            }
                        })
                    )
                })

                this.step(function(){
                    nut.model.count = count;
                    if(count==0){
                        helper.db.coll("ocuser/users").insert(postData,this.hold(function(err,doc){
                            if(err){
                                throw err;
                            }else{
                                nut.message("保存成功",null,'success') ;
                            }
                        }))
                    }else{
                        nut.message("用户名已存在,请重新输入",null,'error') ;
                    }
                })
            }
        }
    }
}

function encryptPassword(password,userDoc){
    return helper.util.md5(helper.util.md5(password) + userDoc.username + userDoc.createTime ) ;
}
