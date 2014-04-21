module.exports={
    layout:"welab/Layout",
    view:"lavico/templates/answerQuestion/statistics/statistics_list.html",
    process:function(seed,nut){
        var then=this;

        var themeArr=[];


        helper.db.coll("lavico/themeQuestion").find({}).toArray(this.hold(function(err,doc){
            if(err) throw err;
            then.step(function(){
             for(var e in doc){
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
                             {$group:{_id:"$themeId",count:{$addToSet:"$wechatid"}}},
                             {$match:{_id:helper.db.id(i)}}
                         ],then.hold(function(err,doc){
                             if(err) throw err;
                             try{
                                 jsonOne.totalPop=doc[0].count.length;
                             }catch(e){
                                 jsonOne.totalPop=0;
                             }
                         }));

                 })(doc[e]._id,jsonOne);

                 //完成人数
                 (function(i,jsonOne){
                     helper.db.coll("lavico/custReceive").find({"themeId":helper.db.id(doc[e]._id),"isFinish":true,"optionId":0,"getLabel":"","getGift":"","compScore":""})
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
            });
        }))

        then.step(function(){

            pageSize=20
            page={}
            page.lastPage=themeArr.length%pageSize==0 ? parseInt(themeArr.length/pageSize) : parseInt(themeArr.length/pageSize)+1;
            page.currentPage=typeof(seed.page)=="undefined"?1:seed.page
            page.totalCount=themeArr.length
            page.docs=[]
            for(var j=(page.currentPage-1)*pageSize;j<(page.currentPage-1)*pageSize+20;j++){
                if(typeof(themeArr[j])!="undefined")
                    page.docs.push(themeArr[j])
            }
            nut.model.docs=page.docs;

            //nut.model.docs=themeArr;
        })
    },
    actions:{
        close:{
            process:function(seed,nut){
                helper.db.coll("lavico/themeQuestion").findOne({_id:helper.db.id(seed._id)},this.hold(
                    function(err,doc){
                        if(err) throw err
                        if(doc){
                            console.log(doc.isOpen);
                            var iOpen=doc.isOpen==0?'1':'0';
                            helper.db.coll("lavico/themeQuestion").update({_id:helper.db.id(seed._id)},{$set:{isOpen:iOpen}},
                                this.hold(function(err,doc){
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
                    //this.res.writeHead(302, {'Location': "/lavico/answerQuestion/");
                    //this.res.end();
                }));
            }
        }
    },
    viewIn:function(){
        $("input[name='btnDel']").click(function(){
            var id=$(this).parent().prev().prev("input[type=hidden]").val();
            $.get("/lavico/answerQuestion/statistics/statistics_list:del",{_id:id} ,function(result){
                location.href='/lavico/answerQuestion/statistics/statistics_list';
            });
        });

        $("input[name='btnOpenClose']").click(function(){
            var id=$(this).parent().prev("input[type=hidden]").val();
            if($(this).val()=="开"){
                $(this).val("关");
            }else{
                $(this).val("开");
            }
            $.get("/lavico/answerQuestion/statistics/statistics_list:close",{_id:id},function(result){
                location.href='/lavico/answerQuestion/statistics/statistics_list';
            })
        });

        $("input[name='btnStatistics']").click(function(){
            var themeVal=$(this).next("input[name='tongji']").val();
            var themeValArr= themeVal.split("_");
            location.href="/lavico/answerQuestion/statistics/statistics_true?_id="+themeValArr[2]+"&finishCount="+themeValArr[0]+"&totalPop="+themeValArr[1];
        });
    }
}