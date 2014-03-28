module.exports={
	  layout:null,
    view:"lavico/templates/answerQuestion/answer.html",
    process:function(seed,nut){
    	var _id=seed._id;
        var optionId=seed.optionId;
    	var beginTime="",endTime="",isOpen="";
        var wechatid=seed.wechatid;

        if(optionId==1){
            this.req.session.scoreAll=0;
        }

        console.log(wechatid);

    	//判断活动是否开启或到期
    	this.step(function(){
        //判断活动是否开启或到期
	        helper.db.coll("lavico/themeQuestion").findOne({"_id":helper.db.id(_id)},this.hold(function(err,doc){
	            if(err)throw err;
	            beginTime=doc.beginTime;
	            endTime=doc.endTime;
	            isOpen=doc.isOpen;
	        	}));
    	});
    	this.step(function(){
        if(new Date(beginTime).getTime()<new Date(createTime()).getTime() && new Date(endTime).getTime()>new Date(createTime()).getTime()){
           if(isOpen==0){//0 close;
              nut.write("<script>alert('很抱歉，活动已经停止');history.back();</script>");
           }else{//1 activity open;show option
              helper.db.coll("lavico/themeQuestion").findOne({"_id":helper.db.id(_id)},this.hold(function(err,cursor){
                   if(err) throw err;
                   for(var i=0;i<cursor.options.length;i++){
                    if(optionId==cursor.options[i].optionId){
                      nut.model.option=JSON.stringify(cursor.options[i]);
                      nut.model._id=_id;
                      nut.model.optionCount=cursor.options.length;
                      nut.model.wechatid=wechatid;
                    }
                   }
               }));
           }
       }else{
        nut.write("<script>alert('很抱歉，活动已经停止');history.back();</script>");
       }

      });

     nut.model.wechatid=wechatid;
  }
}
function createTime(){
    var d = new Date();
    var vYear = d.getFullYear();
    var vMon = d.getMonth() + 1;
    var vDay = d.getDate();
    s=vYear+"-"+(vMon<10 ? "0" + vMon : vMon)+"-"+(vDay<10 ? "0"+ vDay : vDay);
    return s;
}