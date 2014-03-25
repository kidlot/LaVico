module.exports={
	layout:null,
    view:null,
    process:function(seed,nut){
        var then=this;
    	var type=seed.type;
        var optionId=seed.optionId;
        var _id=seed._id;
        var chooseId=seed.chooseId;
        var score=seed.score;
        var chooseNext=seed.chooseNext;
        var wechatid=seed.wechatid;
        var finish=seed.finish;
        var mutilFlag=false;
        //single or mutil: isNum

        if(!isNaN(parseInt(score))){
        	//number
        	helper.db.coll("lavico/custReceive").findOne({"themeId":helper.db.id(_id),"isFinish":false,"wechatid":wechatid,"optionId":parseInt(optionId)},this.hold(function(err,doc){
                if(err)throw err;
                //update score
                if(doc!=null){
                    helper.db.coll("lavico/custReceive").update({"themeId":helper.db.id(_id),"isFinish":false,"wechatid":wechatid,"optionId":parseInt(optionId)},
                        {$set:{"getScore":parseInt(score)}},function(err,doc){});
                }
                else{
                    mutilFlag=true;
                    /*
                    //session
                    then.req.session.scoreAll+=parseInt(score);
                    console.log("scoreAll:"+then.req.session.scoreAll);
                    //不存在录入
                    helper.db.coll("lavico/custReceive").insert({
                        "custId": custId,
                        "themeId": helper.db.id(_id),
                        "isFinish": false,
                        "optionId": parseInt(optionId),
                        "chooseId": parseInt(chooseId),
                        "getChooseScore": parseInt(score),
                        "getChooseLabel":"",
                        "getLabel": "",
                        "getGift":  "",
                        "compScore": "",
                        "createTime": createTime()
                        },function(err,doc){});
                        */

                }

            }))
        }else{
        	//not number,next option
        	console.log("_id:"+_id+"\noptionId:"+optionId+"\nchooseId:"+chooseId+"IS NOT NUMBER");
        }
        //标签操作，单选题执行，复选题没有标签

        //single is lab
      if(type==0){
        if(chooseNext==""){
        	//next is empty,default next option
            //判断是否为完成（最后一页）
            if(finish!=true){
        	   this.res.writeHead(302, {'Location': "/lavico/answerQuestion/answer?_id="+_id+"&optionId="+(parseInt(optionId)+1)});
               this.res.end();
            }
            else{

                this.res.writeHead(302, {'Location': "/lavico/answerQuestion/finish?_id="+_id+"&optionId="+optionId});
                this.res.end();
            }
        }else{
            console.log(",:"+chooseNext.indexOf(','));
        	//isNum
        	if(chooseNext.indexOf(',')!=-1){
                console.log("go");
        		//no number,go to finish
        		//record lab
                var choArr=chooseNext.split(',');

                for(var i=0;i<choArr.length;i++){
                    helper.db.coll("lavico/custReceive").insert({
                            "wechatid": wechatid,
                            "themeId": helper.db.id(_id),
                            "isFinish": true,
                            "optionId": parseInt(optionId),
                            "chooseId": parseInt(chooseId),
                            "getChooseScore": 0,
                            "getChooseLabel":"",
                            "getLabel": choArr[i],
                            "getGift":  "",
                            "compScore": "",
                            "createTime": createTime()
                            },function(err,doc){
                        });
                }
        		this.res.writeHead(302, {'Location': "/lavico/answerQuestion/finish?flag=false&_id="+_id+"&optionId="+optionId});
             	this.res.end();
        	}else{
                console.log(chooseNext);
        		//is number
        		this.res.writeHead(302, {'Location': "/lavico/answerQuestion/answer?_id="+_id+"&optionId="+parseInt(chooseNext)});
             	this.res.end();
        	}
        }
      }else if(type==1){


          if(mutilFlag){
              helper.db.coll("lavico/custReceive").insert({
                  "wechatid": wechatid,
                  "themeId": helper.db.id(_id),
                  "isFinish": false,
                  "optionId": parseInt(optionId),
                  "chooseId": parseInt(chooseId),
                  "getChooseScore": parseInt(score),
                  "getChooseLabel":"",
                  "getLabel": "",
                  "getGift":  "",
                  "compScore": "",
                  "createTime": createTime()
              },function(err,doc){});
          }




         if(finish!=true){
               this.res.writeHead(302, {'Location': "/lavico/answerQuestion/answer?_id="+_id+"&optionId="+(parseInt(optionId)+1)});
               this.res.end();
         }
         else{
             this.res.writeHead(302, {'Location': "/lavico/answerQuestion/finish?flag=true&_id="+_id+"&optionId="+optionId});
             this.res.end();
         }
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