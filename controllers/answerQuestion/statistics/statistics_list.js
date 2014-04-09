module.exports={
    layout:"welab/Layout",
    view:"lavico/templates/answerQuestion/statistics/statistics_list.html",
    process:function(seed,nut){
        helper.db.coll("lavico/themeQuestion").find({}).toArray(this.hold(function(err,doc){
          if(err) throw err;
          var themeArr=[];
          for(var e in doc){
              var jsonOne={};
              jsonOne.beginTime=doc[e].beginTime;
              jsonOne.endTime=doc[e].endTime;
              jsonOne.isOpen=doc[e].isOpen;
              jsonOne.theme=doc[e].theme;
              jsonOne.themeType=doc[e].themeType;
              //参与人数
              helper.db.coll("lavico/custReceive").aggregate(
                  [

                      {$group:{_id:"$themeId",totalPop:{$count:"$wechatid"}}},
                      {$match:{_id:doc[e].themeId}}
                  ],
                  this.hold(function(err,doc){
                     console.log(doc);
                  })
              )

              //完成人数
              helper.db.coll("lavico/custReceive")
                  .find({"themeId":helper.db.id(doc[e]._id),"isFinish":true,"optionId":0,"getLabel":"","getGift":"","compScore":""}).count(
                  this.hold(function(err,doc){
                      if(err)throw err;
                      //console.log(doc);
                      //console.log(typeof doc);
                      if(doc==0)
                        jsonOne.finishCount=0;
                      else
                        jsonOne.finishCount=doc;
                  })
              );


              themeArr.push(jsonOne);
          }
          nut.model.docs=themeArr;

        }));
    }
}