module.exports={
	  layout:null,
    view:"lavico/templates/answerQuestion/updateTheme.html",
    process:function(seed,nut){
    	var _id="532cfe483d883c440c000c72";
    	helper.db.coll("lavico/themeQuestion").findOne({"_id":helper.db.id(_id)},function(err,doc){
    		if(err) throw err;
    		if(doc){
    			nut.model.themeDoc=JSON.stringify(doc);
    		}
    	});
    }
};