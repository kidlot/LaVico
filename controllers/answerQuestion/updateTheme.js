module.exports={
	layout:"welab/Layout",
    view:"lavico/templates/answerQuestion/updateTheme.html",
    process:function(seed,nut){
    	var _id=seed._id;
    	helper.db.coll("lavico/themeQuestion").findOne({"_id":helper.db.id(_id)},function(err,doc){
    		if(err) throw err
    		if(doc)	nut.model.themeDoc=JSON.stringify(doc);
            nut.model._id=_id;
    	});
    }
};