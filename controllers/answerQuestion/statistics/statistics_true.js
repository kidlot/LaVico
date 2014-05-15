/**
 * Created by root on 14-4-8.
 */
module.exports={
    layout:"welab/Layout",
    view:"lavico/templates/answerQuestion/statistics/statistics_true.html",
    process:function(seed,nut){

        var then=this
        var _id=seed._id
        var docOne={}
        this.req.session.allCountPeople=0
        var allRight=[]

        docOne.finishCount=seed.finishCount
        docOne.totalPop=seed.totalPop
        //父进程变量传入字变量
        seed["$lab"]= {_id:seed._id}
        seed["$score"]={_id:seed._id}
        seed["$finishPeople"]= {_id:seed._id}
        seed["$exportXsl"]={_id:seed._id}

        then.step(function(){
            helper.db.coll("lavico/themeQuestion").findOne({_id:helper.db.id(_id)},this.hold(function(err,doc){
                if(err) throw err
                docOne.doc=doc
            }))
        })

        then.step(function(){

            helper.db.coll("lavico/custReceive").find({themeId:helper.db.id(_id)}).toArray(this.hold(function(err,doc){
                if(err) throw err
                for(var doco in docOne.doc.options){
                    for(var i in docOne.doc.options[doco].choose){
                        if(docOne.doc.options[doco].choose[i].isCorrect==1){
                            //全对
                            (function(a,j){
                                var allRightList={};
                                //答对的正确的人
                                helper.db.coll("lavico/custReceive").count({"themeId":helper.db.id(_id),"optionId":j.optionId,
                                    "chooseId":j.choose[a].chooseID},then.hold(function(err,doc){
                                        if(err)throw err
                                        var rightOne={}
                                        rightOne.themeId=_id
                                        rightOne.optionId= j.optionId
                                        rightOne.rightNum=doc
                                        allRight.push(rightOne)
                                }))

                                //答过此题的人
                                helper.db.coll("lavico/custReceive").count({"themeId":helper.db.id(_id),"optionId":j.optionId},
                                    then.hold(function(err,doc){
                                    if(err)throw err
                                        for(var i in allRight){
                                            if(allRight[i].themeId==_id && allRight[i].optionId== j.optionId){
                                                allRight[i].allNum=doc
                                            }
                                        }
                                }))

                                //所有答对题的人
                                helper.db.coll("lavico/custReceive").find({"themeId":helper.db.id(_id),"optionId":j.optionId,
                                    "chooseId":j.choose[a].chooseID}).toArray(
                                        then.hold(function(err,doc){
                                           if(err) throw err;

                                           for(var i in doc){
                                                if(allRightList.wechatid==doc[i].wechatid){
                                                    allRightList.rightNum=allRightList.rightNum+1;

                                                    if(allRightList[doc[i].wechatid]==docOne.doc.options.length)
                                                        then.req.session.allCountPeople++;
                                                }else{
                                                    allRightList.themeId=_id
                                                    allRightList.optionId= j.optionId
                                                    allRightList.chooseId=j.choose[a].chooseID
                                                    allRightList.rightNum=1
                                                }
                                           }
                                        })
                                    )

                            })(i,docOne.doc.options[doco])
                        }

                    }
                }

                nut.model.allCountPeople=then.req.session.allCountPeople
            }));
        })

        then.step(function(){
            nut.model.allRight=allRight
            nut.model.docs=docOne;
            console.log("docs:"+nut.model.docs._id)
            console.log("allRight:"+nut.model.allRight.themeId)
        })

    },
    actions:{
        exportXsl:{
            view:null,
            process:function(seed,nut){
                var then=this
                var docs_themeQuestion3
                var _id=seed._id
                var finishMan=[]

                    then.step(function(){
                        helper.db.coll("lavico/custReceive").find({themeId:helper.db.id(_id),isFinish:true,optionId:0,chooseId:0})
                            .toArray(then.hold(function(err,doc){
                                for(var i in doc){
                                    var manInfo={};
                                    manInfo.name=doc[i].wechatid;
                                    finishMan.push(manInfo);
                                }
                            }))
                    });
                    then.step(function(){
                        for(var i in finishMan){
                            (function(i){
                                helper.db.coll("lavico/custReceive").find({themeId:helper.db.id(_id),isFinish:true,wechatid:finishMan[i].name})
                                    .toArray(then.hold(function(err,doc){
                                        for(var i in doc){

                                            for(var j in finishMan){
                                                if(finishMan[j].name==doc[i].wechatid){
                                                    finishMan[j].getLabel=doc[i].getLabel
                                                    finishMan[j].getGift=doc[i].getGift
                                                    finishMan[j].compScore=doc[i].compScore
                                                    finishMan[j].createTime=doc[i].createTime;

                                                    (function(j){
                                                        helper.db.coll("welab/customers").findOne({"wechatid":finishMan[j].name},then.hold(function(err,doc){
                                                            if(err) throw err
                                                            if(doc){
                                                                finishMan[j].realname=doc.realname
                                                                finishMan[j].gender=doc.gender
                                                                finishMan[j].birthday=doc.birthday
                                                                finishMan[j].city=doc.city
                                                            }
                                                        }))
                                                    })(j)
                                                }
                                            }
                                        }
                                    }))
                            })(i)
                        }
                    })

                    then.step(function(){

                        //exportXsl
                        var nodeExcel = require('excel-export');
                        var conf = {};
                        conf.cols = [
                            {
                                caption: '时间',
                                type: 'string'
                            }, {
                                caption: '姓名',
                                type: 'string'
                            }, {
                                caption: '年龄',
                                type: 'string'
                            }, {
                                caption: '城市',
                                type: 'string'
                            }, {
                                caption: '获得礼券',
                                type: 'string'
                            }, {
                                caption: '获得标签',
                                type: 'string'
                            }, {
                                caption: '奖励积分',
                                type: 'string'
                            }
                        ];
                        conf.rows = [];
                        for(var i in finishMan){
                           var rows
                           rows = [
                                finishMan[i].createTime=new Date(finishMan[i].createTime)).getFullYear()}-(new Date(finishMan[i].createTime)).getMonth()-(new Date(finishMan[i].createTime)).getDate(),
                                finishMan[i].realname,
                                finishMan[i].birthday=,
                                if((typeof(finishMan[i].city)=="undefined"){
                                    finishMan[i].city,
                                }else{
                                    finishMan[i].city,
                                }
                                finishMan[i].getGift,
                                finishMan[i].getLabel,
                                finishMan[i].compScore
                            ]
                            conf.rows.push(rows)
                        }

                        var result = nodeExcel.execute(conf);
                        this.res.setHeader('Content-Type', 'application/vnd.openxmlformats');
                        this.res.setHeader("Content-Disposition", "attachment; filename=Report.xlsx");
                        this.res.write(result, 'binary');
                        return this.res.end();

                    })
            }
        }
    },
    children:{
        finishPeople:{
            view:"lavico/templates/answerQuestion/statistics/statistics_true_3.html",
            process:function(seed,nut){

                var then=this;
                var docs_themeQuestion3;
                var _id=seed._id;
                var finishMan=[];
                try{
                    then.step(function(){
                        helper.db.coll("lavico/custReceive").find({themeId:helper.db.id(_id),isFinish:true,optionId:0,chooseId:0,getLabel:"",getGift:"",compScore:""})
                            .toArray(then.hold(function(err,doc){
                                for(var i in doc){
                                    var manInfo={};
                                    manInfo.name=doc[i].wechatid;
                                    finishMan.push(manInfo);
                                }
                            }))
                    });
                    then.step(function(){
                        for(var i in finishMan){
                            (function(i){
                                helper.db.coll("lavico/custReceive").find({themeId:helper.db.id(_id),isFinish:true,wechatid:finishMan[i].name})
                                    .toArray(then.hold(function(err,doc){
                                        for(var i in doc){

                                            for(var j in finishMan){
                                                if(finishMan[j].name==doc[i].wechatid){
                                                    finishMan[j].getLabel=doc[i].getLabel
                                                    finishMan[j].getGift=doc[i].getGift
                                                    finishMan[j].compScore=doc[i].compScore
                                                    finishMan[j].createTime=doc[i].createTime;

                                                    (function(j){
                                                        helper.db.coll("welab/customers").findOne({"wechatid":finishMan[j].name},then.hold(function(err,doc){
                                                            if(err) throw err
                                                            if(doc){
                                                                 finishMan[j].realname=doc.realname
                                                                 finishMan[j].gender=doc.gender
                                                                 finishMan[j].birthday=doc.birthday
                                                                 finishMan[j].city=doc.city
                                                            }
                                                        }))
                                                    })(j)
                                                }
                                            }
                                        }
                                    }))
                            })(i)
                        }
                    });

                    then.step(function(){
                        pageSize=10
                        page={}
                        page.lastPage=finishMan.length%pageSize==0 ? parseInt(finishMan.length/pageSize) : parseInt(finishMan.length/pageSize)+1;
                        page.currentPage=typeof(seed.page)=="undefined"?1:seed.page
                        page.totalCount=finishMan.length
                        page.docs=[]

                        for(var j=(page.currentPage-1)*pageSize;j<(page.currentPage-1)*pageSize+10;j++){
                            if(typeof(finishMan[j])!="undefined")
                                page.docs.push(finishMan[j])
                        }
                        nut.model.page=page.docs
                        nut.model._id=_id
                        //nut.model.optionId=optionId
                    })
                }catch(e){
                    if(e) throw e;
                }
            },
            viewIn:function(){
                $("input[name=btnExcel]").click(function(){
                    $.get("statistics_true:exportXsl",{_id:$("input[name=_id]").val()},function(result){
                    });
                })
            }
        },

        score:{
            view:"lavico/templates/answerQuestion/statistics/statistics_true_2.html",
            process:function(seed,nut){
                var then=this;
                var docs_themeQuestion2;
                var _id=seed._id;
                var all2=0;
                then.step(function(){
                    helper.db.coll("lavico/themeQuestion").findOne({_id:helper.db.id(_id)},then.hold(function(err,doc){
                        if(err) throw err;
                        docs_themeQuestion2=doc;
                    }))
                });

                then.step(function(){
                    for(var i in docs_themeQuestion2.scoreMinMax){
                        var score=docs_themeQuestion2.scoreMinMax[i].getScore;
                        (function(x,w){
                            helper.db.coll("lavico/custReceive").count({themeId:helper.db.id(_id),isFinish:true,compScore:x},
                              then.hold(function(err,doc){
                                if(err) throw err;
                                w.sinScore=doc;
                                all2+=doc;
                            }))
                        })(score,docs_themeQuestion2.scoreMinMax[i]);
                    }
                });

                then.step(function(){
                    nut.model.docs_2=docs_themeQuestion2
                    nut.model.all2=all2;
                })
            }
        },

        lab:{
            view:"lavico/templates/answerQuestion/statistics/statistics_true_1.html",
            process:function(seed,nut){
                var then=this;
                var docs_themeQuestion
                var _id=seed._id;
                then.step(function(){
                    helper.db.coll("lavico/themeQuestion").findOne({_id:helper.db.id(_id)},then.hold(function(err,doc){
                        if(err) throw err;
                        docs_themeQuestion=doc;
                    }))
                });

                then.step(function(){
                    helper.db.coll("lavico/custReceive").find({themeId:helper.db.id(_id),isFinish:true,optionId:0,chooseId:0,getLabel:"",getGift:"",compScore:""})
                        .toArray(function(err,doc){
                            //console.log("doc:"+doc)
                            if(err) throw err;
                            var xinArr=[];
                            var all=0;
                            for(var i in docs_themeQuestion.scoreMinMax){
                                for(var j in doc){
                                    //console.log("docs_themeQuestion.scoreMinMax[i].conditionMinScore:"+docs_themeQuestion.scoreMinMax[i].conditionMinScore);
                                    //console.log("doc[j].getChooseScore:"+doc[j].getChooseScore)
                                    //console.log("docs_themeQuestion.scoreMinMax[i].conditionMaxScore:"+docs_themeQuestion.scoreMinMax[i].conditionMaxScore);

                                    if(docs_themeQuestion.scoreMinMax[i].conditionMinScore<=doc[j].getChooseScore &&
                                        doc[j].getChooseScore<= docs_themeQuestion.scoreMinMax[i].conditionMaxScore)
                                    {
                                        //console.log("ok");
                                        if(docs_themeQuestion.scoreMinMax[i].sinCount){
                                            docs_themeQuestion.scoreMinMax[i].sinCount++;
                                        }else{
                                            docs_themeQuestion.scoreMinMax[i].sinCount=1;
                                        }
                                        all++;
                                    }
                                }
                            }
                            nut.model.docs_1=docs_themeQuestion;
                            nut.model.all=all;
                        })
                })
            }
        }
    },
    viewIn:function(){
        $('#datetimepicker_s').datetimepicker({
            format: 'yyyy-mm-dd',
            autoclose: true,
            minView: 2
        }).on('changeDate', function(ev)
            {
                $.controller("/welab/summary/statistics_true",{
                    start: $("#datetimepicker_s").val() ,
                    end: $("#datetimepicker_t").val()
                },'.childview:last()>.ocview') ;
            });
    }
}