//<a href=Review?_id="+data[o]._id>浏览</a></td></tr>
module.exports={
    layout:null,
    view:"lavico/templates/AnswerQuestion/Review.html",
    process:function(seed,nut){
        var _id=seed._id;
        var beginTime="",endTime="",isOpen="";
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
           if(isOpen!=0){
               /*
               //记录用户参与
               helper.db.coll("lavico/custReceive").insert({
                   "custId":"cust101",//会员号
                   "themeId":_id,//题号
                   "isFinish":false,//是否完成答题
                   "getScore":0,//获得总分
                   "getLabel":"",//获得标签
                   "optionId":0,//题号
                   "chooseId":0,//选项号
                   "getGift":"",//获得礼券
                   "compScore":"",//商户提供积分
                   "createTime":createTime()//创建时间
               },function(err,doc){
                   if(err)throw err;
               });
                */
               //显示数据
               helper.db.coll("lavico/themeQuestion").findOne({"_id":helper.db.id(_id)},this.hold(function(err,cursor){
                   if(err) throw err;
                   nut.model.option=JSON.stringify(cursor.options[0]);
                   nut.model.themeId=_id;
                   nut.model.optionCount=cursor.options.length;
               }));
           }else{
               //overtime

           }
        }else{
            //overtime
        }
    });
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

function toDate(str){
    var sd=str.split("-");
    return new Date(sd[0],sd[1],sd[2]);
}