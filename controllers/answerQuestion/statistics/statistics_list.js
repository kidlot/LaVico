module.exports={
    layout:"welab/Layout",
    view:"lavico/templates/answerQuestion/statistics/statistics_list.html",
    process:function(seed,nut){
        var then=this;
        var themeArr=[];
        var themetype = seed.themetype ? seed.themetype : 0;
        nut.model.themetype = themetype;
        this.step(function(){
            if(themetype==1){
                helper.db.coll("lavico/themeQuestion").find({themeType:1}).toArray(this.hold(function(err,docs){
                    if(err) throw  err;
                    if(docs){
                        return docs;
                    }
                }))
            }else{
                helper.db.coll("lavico/themeQuestion").find({themeType:{$ne:1}}).toArray(this.hold(function(err,docs){
                    if(err) throw  err;
                    if(docs){
                        return docs;
                    }
                }))
            }
        })

        this.step(function(doc){
            if(doc){
                for(var e=0;e<doc.length;e++){
                    var jsonOne={};
                    jsonOne.beginTime=doc[e].beginTime;
                    jsonOne.endTime=doc[e].endTime;
                    jsonOne.isOpen=doc[e].isOpen;
                    jsonOne.theme=doc[e].theme;
                    jsonOne.themeType=doc[e].themeType;
                    jsonOne.themeId=doc[e]._id;

                    //参与人数
                    (function(i,jsonOne){
                        helper.db.coll("lavico/custReceive").aggregate(
                            [
                                {$match:{themeId:i}},
                                {$group:{_id:"$memberId"}}
                            ],then.hold(function(err,doc){
                                if(err) throw err;
                                try{
                                    jsonOne.totalPop=doc.length;
                                }catch(e){
                                    jsonOne.totalPop=0;
                                }

                            }));

                    })(doc[e]._id,jsonOne);

                    //完成人数
                    (function(i,jsonOne){
                        helper.db.coll("lavico/custReceive").find({"themeId":i,"isFinish":true,"type":"0"})
                            .count(
                                then.hold(function(err,doc){
                                    if(err)throw err;
                                    if(doc==0){
                                        jsonOne.finishCount=0;
                                    }
                                    else{
                                        jsonOne.finishCount=doc;
                                    }
                                })
                            )
                        themeArr.push(jsonOne);
                    })(doc[e]._id,jsonOne);
                }
            }

        })

        then.step(function(){
            pageSize=20
            var data=[];
            page={}
            page.lastPage=themeArr.length%pageSize==0 ? parseInt(themeArr.length/pageSize) : parseInt(themeArr.length/pageSize)+1;
            page.currentPage=typeof(seed.page)=="undefined"?1:parseInt(seed.page);
            page.totalCount=themeArr.length

            for(var j=(page.currentPage-1)*pageSize;j<(page.currentPage-1)*pageSize+pageSize;j++){
                if(typeof(themeArr[j])!="undefined")
                    data.push(themeArr[j])
            }

            for(var i=0;i<data.length;i++){
                data[i].beginTime = data[i].beginTime;
                data[i].endTime = data[i].endTime;
                data[i].isOpen = data[i].isOpen;
                data[i].theme = data[i].theme;
                data[i].themeType = data[i].themeType;
                data[i].themeId = data[i].themeId;
                data[i].totalPop = data[i].totalPop;
                data[i].finishCount = data[i].finishCount;
                data[i].count = ForDight(data[i].totalPop,data[i].finishCount)
              }

            nut.model.data = data;
            nut.model.page=page || {};
        })
    },
    actions:{
        close:{
            process:function(seed,nut){

                helper.db.coll("lavico/themeQuestion").findOne({_id:helper.db.id(seed._id)},this.hold(
                    function(err,doc){
                        if(err) throw err
                        if(doc){
                            var iOpen=doc.isOpen==0?'1':'0';
                            helper.db.coll("lavico/themeQuestion").update({_id:helper.db.id(seed._id)},{$set:{isOpen:iOpen}},
                                this.hold(function(err,doc){
                                    if(err) throw  err;
                                }));
                        }
                    })
                )
            }
        },
        del:{
            process:function(seed,nut){
                helper.db.coll("lavico/themeQuestion").remove({_id:helper.db.id(seed._id)},this.hold(function(err,doc){
                    if(err) throw err;
                    this.res.writeHead(302, {'Location': "/lavico/answerQuestion/statistics/statistics_list?themetype="+seed.themetype});
                    this.res.end();
                }));
            }
        }
    },
    viewIn:function(){
        $("input[name='btnDel']").click(function(){
            var themeVal = $(this).next("input[name='del']").val();
            var themeValArr= themeVal.split("_");
            $.get("/lavico/answerQuestion/statistics/statistics_list:del?_id="+themeValArr[2] ,function(result){
                location.href='/lavico/answerQuestion/statistics/statistics_list?themetype='+themeValArr[3];
            });
        });



        $("input[name='btnStatistics']").click(function(){
            var themeVal=$(this).next("input[name='tongji']").val();
            var themeValArr= themeVal.split("_");
            location.href="/lavico/answerQuestion/statistics/statistics_true?_id="+themeValArr[2]+"&finishCount="+themeValArr[0]+"&totalPop="+themeValArr[1]+"&themetype="+themeValArr[3];
        });
    }
}
function   ForDight(Dight,How){
    var num   =   Math.round(How/Dight*100)+"%";
    return   num;
}
