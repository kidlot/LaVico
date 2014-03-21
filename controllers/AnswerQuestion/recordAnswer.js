module.exports={
    layout:null,
    view:"lavico/templates/AnswerQuestion/Review.html",
    process:function(seed,nut){
        var _id=seed._id;
        var optionId=seed.optionId;
        //显示数据
        helper.db.coll("lavico/themeQuestion").findOne({"_id":helper.db.id(_id)},this.hold(function(err,cursor){
            if(err) throw err;
            for(var i=0;i<cursor.options;i++){
                if(cursor.option[i].optionId=optionId){
                    nut.model.option=JSON.stringify(cursor.options[i]);
                    nut.model.themeId=_id;
                    nut.model.optionCount=cursor.options.length;
                }
            }
        }));
    }
}
