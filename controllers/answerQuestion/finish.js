module.exports={
	layout:null,
    view:"lavico/templates/answerQuestion/finish.html",
    process:function(seed,nut){
        var then=this;
    	var _id=seed._id;
    	var opptionId=seed.optionId;
    	var wechatid=seed.wechatid;
    	var scoreAll=this.req.session.scoreAll;
        var stopLab=seed.stopLab;
        //非停止标签过来
        console.log(stopLab);
        if(stopLab!="true"){
            //插入总积分
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

        //查找单题组,获取分值范围数组
    	var scoreRange;
        this.step(function(){
    		helper.db.coll("lavico/themeQuestion").findOne({"_id":helper.db.id(_id)},then.hold(function(err,doc){
	    		if(err) throw err;
    			scoreRange=doc.scoreMinMax;
    		}));
        });
		this.step(function(){
			var resultList="[";
			for(var i=0;i<scoreRange.length;i++){
				var minlen=scoreRange[i].conditionMinScore;//获取低分值
				var maxlen=scoreRange[i].conditionMaxScore;//获取高分值
				if(scoreAll>=minlen && scoreAll<=maxlen){//在分值范围中
                    //获取三个奖励
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

                    //记录json准备显示
					resultList+="{"
						+"getLabel:'"+getLabel
						+"',getScore:"+getScore
						+",getActivities:'"+getActivities+"'}";

				}
                if((scoreAll>=minlen && scoreAll<=maxlen || scoreRange[i].conditionLabel!="") && i<scoreRange.length-1 )
                    resultList+=",";
			}
			resultList+="]";
            //返回显示
			//nut.model.getResult=resultList;

            console.log(resultList);


            nut.model.result=resultList;
		})
      }else{
      //停止标签过来
            //记录总分
            helper.db.coll("lavico/custReceive").insert({
                "wechatid": wechatid,
                "themeId": helper.db.id(_id),
                "isFinish": true,
                "optionId": 0,
                "chooseId": 0,
                "getChooseScore": parseInt(then.req.session.scoreAll),
                "getChooseLabel":"",
                "getLabel": "",
                "getGift":  "",
                "compScore": 0,
                "createTime": createTime()
            },function(err,doc){});




            //记录获得东西
            var scoreRange;
            this.step(function(){
                helper.db.coll("lavico/themeQuestion").findOne({"_id":helper.db.id(_id)},then.hold(function(err,doc){
                    if(err) throw err;
                    scoreRange=doc.scoreMinMax;
                }));
            });
            this.step(function(){
                var resultList="[";
                for(var i=0;i<scoreRange.length;i++){
                    //session上的停止标签和db中的设置标签一致
                    if(then.req.session.customerLabel==scoreRange[i].conditionLabel){
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

                    //判断是否有session自定义标签
                    var custLabel=then.req.session.customerLabel
                    if(custLabel!=""){
                        //存在,录入customer
                        var customerLab="{tags:[";

                        var choArr=custLabel.split(',');
                        if(choArr.length<=1){
                            choArr=custLabel.split(' ');
                        }
                        //记录至customers表
                        for(var i=0;i<choArr.length;i++){
                            customerLab+="'"+choArr[i]+"'"+",";
                        }
                        var jsonStr=customerLab.substring(0,customerLab.lastIndexOf(',')).replace(' ',',')+"]}";

                        customerLab=eval('('+jsonStr+')');
                        helper.db.coll("welab/customers").update({wechatid:wechatid},{$set:customerLab},function(err,doc){});
                    }

                }

                resultList+="]";
                //nut.model.getResult=resultList;
                nut.model.result=resultList;
            })

            /*
            var resultList="[";
            helper.db.coll("lavico/custReceive").find({"themeId":helper.db.id(_id),"wechatid":wechatid,"isFinish":true}).toArray(then.hold(function(err,scoreRange){
                for(var i=0;i<scoreRange.length;i++){
                    var getLabel= scoreRange[i].getLabel=="undefined"?"":scoreRange[i].getLabel;
                    var getActivities= scoreRange[i].getActivities=="undefined"?0:scoreRange[i].getActivities;
                    var getScore= scoreRange[i].getScore==""?0:scoreRange[i].getScore;
                    if(typeof(getScore)=="undefined"){
                        getScore=0;
                    }
                    resultList+="{"
                        +"getLabel:'"+getLabel
                        +"',getScore:"+getScore
                        +",getActivities:'"+getActivities+"'}";
                    if(i<scoreRange.length-1){resultList+=",";}
                }
            resultList+="]";
            nut.model.getResult=resultList;
            }));
            */
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