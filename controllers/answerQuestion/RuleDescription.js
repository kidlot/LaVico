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
                        }
                        nut.message("添加规则说明成功",null,"success");
                    })
                );
            }
        }
    },
    viewIn:function(){
        $("input[name=btnSave]").click(function(){
            var oLinkOptions = {};
            var description = $("#description").val().replace(/[\n\r\t]/,'<br/>');
            var relief = $("#relief").val().replace(/[\n\r\t]/,'<br/>');
            var explanation = $("#explanation").val().replace(/[\n\r\t]/,'<br/>');
            oLinkOptions.data = [{name:'description',value:description},
                {name:"relief",value:relief},
                {name:"explanation",value:explanation}];
            oLinkOptions.type = "POST";
            oLinkOptions.url = "/lavico/answerQuestion/RuleDescription:save";
            $.request(oLinkOptions,function(err,nut){
                if(err) throw err ;
                nut.msgqueue.popup();
            }) ;
        });
    }
}