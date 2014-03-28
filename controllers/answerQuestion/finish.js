//"/lavico/answerQuestion/finish?_id="+_id+"&optionId="+optionId}
module.exports={
	layout:null,
    view:"lavico/templates/answerQuestion/finish.html",
    process:function(seed,nut){
        var then=this;
    	var _id=seed._id;
    	var opptionId=seed.optionId;
    	var wechatid=seed.wechatid;
        //console.log(this.req.session.scoreAll);
    	var scoreAll=this.req.session.scoreAll;
        if(seed.flag!="false")
        {
            //insert true
            helper.db.coll("lavico/custReceive").insert({
                "wechatid": wechatid,
                "themeId": helper.db.id(_id),
                "isFinish": true,
                "optionId": 0,
                "chooseId": 0,
                "getChooseScore": parseInt(scoreAll),
                "getChooseLabel":"",
                "getLabel": "",
                "getGift":  "",
                "compScore": "",
                "createTime": createTime()
                },function(err,doc){
            });



    	var scoreRange;//jsonObject

        //判断是否是标签过来的


        //is get score/lab/quan
        this.step(function(){
    		helper.db.coll("lavico/themeQuestion").findOne({"_id":helper.db.id(_id)},then.hold(function(err,doc){
	    		if(err) throw err;
    			scoreRange=doc.scoreMinMax;
    		}));
        });
		this.step(function(){
			var resultList="[";
			for(var i=0;i<scoreRange.length;i++){
				var minlen=scoreRange[i].conditionMinScore;
				var maxlen=scoreRange[i].conditionMaxScore;
				if(scoreAll>=minlen && scoreAll<=maxlen || scoreRange[i].conditionLabel!=""){


                    var getLabel= scoreRange[i].getLabel==""?"":scoreRange[i].getLabel;
                    var getScore= scoreRange[i].getScore==""?0:scoreRange[i].getScore;
                    var getActivities= scoreRange[i].getActivities==""?0:scoreRange[i].getActivities;



                        helper.db.coll("lavico/custReceive").insert({
                            "wechatid": wechatid,
                            "themeId": helper.db.id(_id),
                            "isFinish": true,
                            "optionId": 0,
                            "chooseId": 0,
                            "getChooseScore": parseInt(then.req.session.scoreAll),
                            "getChooseLabel":"",
                            "getLabel": getLabel,
                            "getGift":  getActivities,
                            "compScore": getScore,
                            "createTime": createTime()
                        },function(err,doc){});







					resultList+="{"
						+"getLabel:'"+getLabel
						+"',getScore:"+getScore
						+",getActivities:'"+getActivities+"'}";

				}
                if((scoreAll>=minlen && scoreAll<=maxlen || scoreRange[i].conditionLabel!="") && i<scoreRange.length-1 )
                    resultList+=",";
			}
			resultList+="]";

            //save


			nut.model.getResult=resultList;
		})

      }else{

            /*

             "custId": "cust101",
             "themeId"▼: ObjectId("532bdf3e5d1c2df820000c7a"),
             "isFinish": true,

             */
            //存入系统表
            /*
            helper.db.coll("welab/customers").findOne({"wechatid":custId},then.hold(function(err,doc){
                if(doc){
                    //update

                }
            }));
            */
            var customerLab="{tags:[";

            var resultList="[";
            console.log("_id:"+_id);
            console.log("wechatid:"+wechatid);
            helper.db.coll("lavico/custReceive").find({"themeId":helper.db.id(_id),"wechatid":wechatid,"isFinish":true}).toArray(then.hold(function(err,scoreRange){

                for(var i=0;i<scoreRange.length;i++){

                    var getLabel= scoreRange[i].getLabel=="undefined"?"":scoreRange[i].getLabel;
                    var getActivities= scoreRange[i].getActivities=="undefined"?0:scoreRange[i].getActivities;
                    var getScore= scoreRange[i].getScore==""?0:scoreRange[i].getScore;
                    if(typeof(getScore)=="undefined"){
                        getScore=0;
                    }


                    customerLab+=getLabel+",";



                    resultList+="{"
                        +"getLabel:'"+getLabel
                        +"',getScore:"+getScore
                        +",getActivities:'"+getActivities+"'}";
                    if(i<scoreRange.length-1){resultList+=",";}
                }
            resultList+="]";
            //console.log(customerLab.substring(0,customerLab.lastIndexOf(',')).replace(' ',',')+"]}");
            customerLab=JSON.parse(customerLab.substring(0,customerLab.lastIndexOf(',')).replace(' ',',')+"]}");
            //console.log(customerLab);//[2014-4-4,ok]
            //helper.db.coll("welab/customers").update({wechatid:wechatid},{$set:customerLab},function(err,doc){});

            nut.model.getResult=resultList;
            }));





        }


        
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