module.exports={
	layout:null,
    view:"lavico/templates/answerQuestion/answer.html",
    process:function(seed,nut){
        var beginTime="",endTime="",isOpen="";
    	var _id=seed._id;//获取题目ID
        var optionId=seed.optionId;//获取题号
        var wechatid=seed.wechatid;//获取微信ID
        if(optionId==1)this.req.session.scoreAll=0;//初始化session

    	this.step(function(){
        //判断活动是否开启或到期1-1
	        helper.db.coll("lavico/themeQuestion").findOne({"_id":helper.db.id(_id)},this.hold(function(err,doc){
	            if(err)throw err;
	            beginTime=doc.beginTime;
	            endTime=doc.endTime;
	            isOpen=doc.isOpen;
	        	}));
    	});
    	this.step(function(){
        //判断活动是否开启或到期1-2
            if(new Date(beginTime).getTime()<new Date(createTime()).getTime() && new Date(endTime).getTime()>new Date(createTime()).getTime()){
               if(isOpen==0){
                  nut.write("<script>alert('很抱歉，活动已经停止');history.back();</script>");
               }else{
               //显示题目
                  helper.db.coll("lavico/themeQuestion").findOne({"_id":helper.db.id(_id)},this.hold(function(err,cursor){
                       if(err) throw err;
                       for(var i=0;i<cursor.options.length;i++){
                       //循环题数
                            if(optionId==cursor.options[i].optionId){
                            //传入题号和当前题号相同,记录题目
                              nut.model.option=JSON.stringify(cursor.options[i]);//以json字符串格式记录,当前此题
                              nut.model._id=_id;
                              nut.model.optionCount=cursor.options.length;//此题目总共有题数
                              nut.model.wechatid=wechatid;
                            }
                       }
                  }));
               }
            }else{
                nut.write("<script>alert('很抱歉，活动已经停止');history.back();</script>");
            }
        });

     //nut.model.wechatid=wechatid;
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