module.exports={
    layout:"welab/Layout",
    view:"lavico/templates/answerQuestion/RuleDescription.html",
    process:function(seed,nut){
        id=seed._id;
        nut.model._id=seed._id;
        helper.db.coll("lavico/themeQuestion").findOne({"_id":helper.db.id(id)},function(err,doc){
            if(err) throw err
            if(doc)	nut.model.doc=doc;
        });
    },
    actions:{
        save:{
            process:function(seed,nut){
                var postData = JSON.parse(seed.postData);
                var _id = seed._id;
                // seed.description = postData.description;
                // seed.relief = postData.relief;
                // seed.explanation = postData.explanation;
                //{description:seed.description,relief:seed.relief,explanation:seed.explanation}=postData
                helper.db.coll("lavico/themeQuestion").update({_id:helper.db.id(_id)},{$set:postData},
                    this.hold(function(err,doc){
                        if(err){
                            throw err;
                        }
                        console.log(doc);
                        //nut.message("添加完成",null,"success");
                    })
                );
            }
        }
    },
}