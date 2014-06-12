/*
 * 应用：活动券-后台应用
 * URL：{host}/lavico/activity
 * */
module.exports={
     layout:"welab/Layout",
     view:"lavico/templates/answerQuestion/RuleDescription.html",
     process:function(seed,nut){
         id=seed._id;
         nut.model._id=seed._id;
         helper.db.coll("lavico/themeQuestion").findOne({"_id":helper.db.id(id)},function(err,doc){
                 if(err) throw err
                     if(doc)
                         nut.model.doc=doc;
                         console.log(doc);
             });
     },
    actions:{
         save:{
                 process:function(seed,nut){
                         var postData = JSON.parse(seed.postData);
                         var _id = seed._id;
                         seed.description = postData.description;
                         seed.relief = postData.relief;
                         seed.explanation = postData.thumb;
                         seed.thumb = postData.explanation;//小图地址
                         seed.pic = postData.pic;//大图地址
                         console.log(postData);
                         helper.db.coll("lavico/themeQuestion").update({_id:helper.db.id(_id)},{$set:postData},
                         this.hold(function(err,doc){
                                 if(err){throw err;}
                                 console.log(doc);
                                 nut.message("保存成功",null,"success");
                         })
                         );
                 }
         }
     }
}
