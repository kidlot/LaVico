module.exports={
    layout:null,
    view:"lavico/templates/score/themeManager.html",
    process:function(seed,nut){
        //从数据库查找数据,并组织为Model
        helper.db.coll("lavico/themeQuestion").find().toArray(this.hold(function(err,cursor){
            var reply="[";
            for(var i=0;i<cursor.length;i++){

                var json=JSON.stringify({
                    //标题
                    theme:cursor[i].theme,
                    //options的数量
                    themeCount:cursor[i].options.length,
                    //创建时间
                    createTime:cursor[i].createTime,
                    //参与人数

                    //完成人数

                    //标题ID
                    _id:cursor[i]._id
                });
                reply+=json;
                if(i<cursor.length-1){reply+=","}
            }
            reply+="]";
            nut.model.jsonReply=reply;
            //
            //console.log(typeof nut.model.jsonReply);//string

        }));

    }
}