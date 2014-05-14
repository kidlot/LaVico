module.exports={
    layout:"welab/Layout",
    view:"lavico/templates/answerQuestion/RuleDescription.html",
    process:function(seed,nut){
        id=seed._id;
        helper.db.coll("lavico/themeQuestion").findOne({"_id":helper.db.id(id)},function(err,doc){
            if(err) throw err
            if(doc)	nut.model.doc=doc;
        });
    },
    actions:{
        save:{
            process:function(seed,nut){
                helper.db.coll("lavico/themeQuestion").update({_id:helper.db.id(id)},{$set:{description:seed.description,relief:seed.relief,explanation:seed.explanation}},
                    this.hold(function(err,doc){
                        if(err){
                            throw err;
                        }else{
                            nut.message("添加完成",null,"success")
                        }
                    })
                );
            }
        }
    },
}