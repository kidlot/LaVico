module.exports={
    layout:null,
    view:"lavico/templates/AnswerQuestion/themeManager.html",
    process:function(seed,nut){
        then = this;
        var partakeCount=new Array();
        var finishCount=new Array();
        //从数据库查找数据,并组织为Model
        this.step(function(){
            helper.db.coll("lavico/themeQuestion").find().toArray(this.hold(function(err,cursor){
                for(var i=0;i<cursor.length;i++){
                    /*
                     *hold只能完成终止下一个step.在当前step中同步操作需要闭包来封装，因为node的回调函数是异步的
                     */
                    (function(i){
                        helper.db.coll("lavico/custReceive").find({"themeId":""+cursor[i]._id,"isFinish":false}).toArray(then.hold(function(err,doc){
                            //参与人数
                            partakeCount[i]=doc.length;
                        }));
                        helper.db.coll("lavico/custReceive").find({"themeId":""+cursor[i]._id,"isFinish":true}).toArray(then.hold(function(err,doc){
                            //完成人数
                            finishCount[i]=doc.length;
                        }));
                    })(i)
                }
            }));
        });
        this.step(function(){
            helper.db.coll("lavico/themeQuestion").find().toArray(this.hold(function(err,cursor){
                var reply="[";
                for(var i=0;i<cursor.length;i++){
                    var json=JSON.stringify({
                        //标题
                        "theme":cursor[i].theme,
                        //options的数量
                        "themeCount":cursor[i].options.length,
                        //创建时间
                        "createTime":cursor[i].createTime,
                        //参与人数
                        "partakeCount":partakeCount[i],
                        //完成人数
                        "finishCount":finishCount[i],
                        //标题ID
                        "_id":cursor[i]._id
                    });
                    reply+=json;
                    if(i<cursor.length-1){reply+=","}
                }
                reply+="]";
                nut.model.jsonReply=reply;
            }));
})


    }

}