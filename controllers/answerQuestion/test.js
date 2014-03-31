module.exports={
    layout:null,
    view:'lavico/templates/answerQuestion/test.html',
    process:function(){
        helper.db.coll("lavico/themeQuestion").aggregate(
           [
               {$match:{isFinish:"false"}},
               {$group:{_id:"$themeId", totalPop:{$sum:"$wechatid"}}}

           ],this.hold(function(err,doc){
                if(err) throw err;
                nut.model.doc=doc;
            }));
    }
}
