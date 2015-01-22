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
        var themetype = seed.themetype ? seed.themetype : 0;
        nut.model.themetype = themetype;
        var allRight=[]

        var startTime = seed.startTime;
        var stopDate = seed.stopDate;


        docOne.finishCount=seed.finishCount
        docOne.totalPop=seed.totalPop
        //父进程变量传入子变量
        seed["$lab"]= {_id:seed._id}
        seed["$score"]={_id:seed._id,themetype:themetype}
        seed["$finishPeople"]= {_id:seed._id,finishCount:seed.finishCount,totalPop:seed.totalPop,themetype:themetype,startTime:startTime,stopDate:stopDate}
        seed["$exportXsl"]={_id:seed._id,themetype:themetype}
        seed["$filterexport"]={_id:seed._id}
        seed["$customerLabel"] = {_id:seed._id}

        then.step(function(){
            helper.db.coll("lavico/themeQuestion").findOne({_id:helper.db.id(_id)},this.hold(function(err,doc){
                if(err) throw err
                docOne.doc=doc
            }))
        })

        then.step(function(){

            helper.db.coll("lavico/custReceive").find({themeId:helper.db.id(_id)}).toArray(this.hold(function(err,doc){
                if(err) throw err
                for(var doco=0;doco<docOne.doc.options.length;doco++){
                    if(docOne.doc.options[doco].choose){
                        for(var i=0;i<docOne.doc.options[doco].choose.length;i++){
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
                                            for(var k=0;k<allRight.length;k++){
                                                if(allRight[k].themeId==_id && allRight[k].optionId== j.optionId){
                                                    allRight[k].allNum=doc
                                                }
                                            }
                                        }))

                                    //所有答对题的人
                                    helper.db.coll("lavico/custReceive").find({"themeId":helper.db.id(_id),"optionId":j.optionId,
                                        "chooseId":j.choose[a].chooseID}).toArray(
                                        then.hold(function(err,doc){
                                            if(err) throw err;

                                            for(var n=0;n<doc.length;n++){
                                                if(allRightList.wechatid==doc[n].wechatid){
                                                    allRightList.rightNum=allRightList.rightNum+1;

                                                    if(allRightList[doc[n].wechatid]==docOne.doc.options.length)
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

                }

                nut.model.allCountPeople=then.req.session.allCountPeople
            }));
        })

        then.step(function(){
            nut.model.allRight=allRight
            nut.model.docs=docOne;

        })

        nut.model.finishCount=seed.finishCount
        nut.model.totalPop=seed.totalPop

    },
    actions:{
        exportXsl:{
            view:null,
            process:function(seed,nut){
                var then=this
                var docs_themeQuestion3
                var _id=seed._id
                var finishMan=[]
                var themetype = seed.themetype;

                then.step(function(){
                    helper.db.coll("lavico/custReceive").find({themeId:helper.db.id(_id),isFinish:true,optionId:0,chooseId:0,"type":"0"})
                        .toArray(then.hold(function(err,doc){
                            for(var i=0;i<doc.length;i++){
                                var manInfo={};
                                manInfo.createTime = formatTime(doc[i].createTime)
                                manInfo.wechatid=doc[i].wechatid;
                                finishMan.push(manInfo);
                            }
                        }))
                });
                then.step(function(){
                    for(var i=0;i<finishMan.length;i++){
                        (function(i){
                            helper.db.coll("lavico/custReceive").find({themeId:helper.db.id(_id),isFinish:true,wechatid:finishMan[i].wechatid,"type":{$ne:"0"}})
                                .toArray(then.hold(function(err,doc){
                                    for(var k=0;k<doc.length;k++){

                                        for(var j=0;j<finishMan.length;j++){
                                            if(finishMan[j].wechatid==doc[k].wechatid){
                                                finishMan[j].getLabel=doc[k].getLabel;
                                                finishMan[j].getGift=doc[k].getGift;
                                                finishMan[j].getScore=doc[k].getScore;

                                                (function(j){
                                                    helper.db.coll("welab/customers").findOne({"wechatid":finishMan[j].wechatid},then.hold(function(err,doc){
                                                        if(err) throw err
                                                        if(doc){
                                                            finishMan[j].realname=doc.realname
                                                            finishMan[j].gender= doc.gender
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
                    var i = 0, len = finishMan.length,
                        j, d;
                    for(; i<len; i++){
                        for(j=0; j<len; j++){
                            if(finishMan[i].createTime > finishMan[j].createTime){
                                d = finishMan[j];
                                finishMan[j] = finishMan[i];
                                finishMan[i] = d;
                            }
                        }
                    }
                })


                then.step(function(){

                    //exportXsl
                    var nodeExcel = require('excel-export');
                    var conf = {};
                    if(themetype=="1"){
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
                    }else{
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
                            },{
                                caption: '奖励积分',
                                type: 'string'
                            }
                        ];
                    }

                    conf.rows = [];
                    for(var i in finishMan){
                        var rows
                        var birthday = parseInt(new Date().getFullYear()-new Date(finishMan[i].birthday).getFullYear());
                        var city
                        if(typeof (finishMan[i].city)=="undefined"){
                            city=""
                        }else{
                            city= finishMan[i].city
                        }

                        var realname
                        if(typeof (finishMan[i].realname)=="undefined"){
                            realname=""
                        }else{
                            realname= finishMan[i].realname
                        }
                        var getGift
                        if(typeof (finishMan[i].getGift)=="undefined"){
                            getGift=""
                        }else{
                            getGift= finishMan[i].getGift
                        }
                        var getLabel
                        if(typeof (finishMan[i].getLabel)=="undefined"){
                            getLabel=""
                        }else{
                            getLabel= finishMan[i].getLabel
                        }
                        var getScore
                        if(typeof (finishMan[i].getScore)=="undefined"){
                            getScore=""
                        }else{
                            getScore= finishMan[i].getScore
                        }
                        if(themetype=="1"){
                            rows = [
                                finishMan[i].createTime,
                                realname,
                                birthday,
                                city,
                                getGift,
                                getLabel,
                                getScore
                            ]
                        }else{
                            rows = [
                                finishMan[i].createTime,
                                realname,
                                birthday,
                                city,
                                getGift,
                                getScore
                            ]
                        }

                        conf.rows.push(rows)
                    }

                    var result = nodeExcel.execute(conf);
                    this.res.setHeader('Content-Type', 'application/vnd.openxmlformats');
                    this.res.setHeader("Content-Disposition", "attachment; filename=Report.xlsx");
                    this.res.write(result, 'binary');
                    return this.res.end();

                })
            }
        },
        filterexport:{
            view:null,
            process:function(seed,nut){
                var filter = seed.filter.split(",");
                var _id = seed._id;
                var then = this;
                var resultList=[];

                then.step(function(){
                    helper.db.coll("lavico/custReceive").find({themeId:helper.db.id(_id),isFinish:true,optionId:0,chooseId:0,"type":{$ne:"0"}}).toArray(then.hold(function(err,doc){
                        if(err) throw err;
                        if(doc){
                            for(var i=0;i<doc.length;i++){
                                for(var j=0;j<filter.length;j++){
                                    if(doc[i].wechatid==filter[j]){
                                        var result={};
                                        result.wechatid=doc[i].wechatid
                                        result.getLabel=doc[i].getLabel
                                        result.getGift=doc[i].getGift
                                        result.getScore=doc[i].getScore
                                        result.createTime=doc[i].createTime;
                                        resultList.push(result);
                                    }
                                }
                            }
                        }
                    }))

                })

                then.step(function(){
                    for(var i=0;i<resultList.length;i++){
                        (function(i){
                            helper.db.coll("welab/customers").findOne({"wechatid":resultList[i].wechatid},then.hold(function(err,doc){
                                if(err) throw err;
                                if(doc){
                                    resultList[i].realname=doc.realname
                                    resultList[i].gender=doc.sex ||doc.gender
                                    resultList[i].birthday=doc.birthday
                                    resultList[i].city=doc.city
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
                    for(var i in resultList){
                        var rows
                        var createtime = new Date(resultList[i].createTime).getFullYear()+"-"+new Date(resultList[i].createTime).getMonth()+"-"+new Date(resultList[i].createTime).getDate();
                        var birthday = parseInt(new Date().getFullYear()-new Date(resultList[i].birthday).getFullYear());
                        var city
                        if(typeof (resultList[i].city)=="undefined"){
                            city=""
                        }else{
                            city= resultList[i].city
                        }

                        var realname
                        if(typeof (resultList[i].realname)=="undefined"){
                            realname=""
                        }else{
                            realname= resultList[i].realname
                        }
                        var getGift
                        if(typeof (resultList[i].getGift)=="undefined"){
                            getGift=""
                        }else{
                            getGift= resultList[i].getGift
                        }
                        var getLabel
                        if(typeof (resultList[i].getLabel)=="undefined"){
                            getLabel=""
                        }else{
                            getLabel= resultList[i].getLabel
                        }
                        var getScore
                        if(typeof (resultList[i].getScore)=="undefined"){
                            getScore=""
                        }else{
                            getScore= resultList[i].getScore
                        }
                        rows = [
                            createtime,
                            realname,
                            birthday,
                            city,
                            getGift,
                            getLabel,
                            getScore
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

                var finishCount=seed.finishCount;
                var totalPop=seed.totalPop;
                nut.model._id=_id;



                nut.model.themetype = seed.themetype ? seed.themetype : 0;

                nut.model.finishCount=finishCount
                nut.model.totalPop=totalPop;

                nut.model.themetype = seed.themetype;

                var startTime = seed.startTime || "undefined";
                var stopTime = seed.stopDate || "undefined";

                var dTime = new Date();
                var _start_ym = dTime.getFullYear() + "-" + (dTime.getMonth()-2);//默认三个月内的数据
                var _end_ym = dTime.getFullYear() + "-" + (dTime.getMonth()+1);//默认三个月内的数据

                var startDate = new Date(startTime+" 00:00:00").getTime();
                var endTime =  new Date(stopTime+" 23:59:59").getTime();

                if(startTime == "undefined" && stopTime == "undefined"){
                    startDate = new Date(_start_ym+" 00:00:00").getTime();
                    endTime =  new Date(_end_ym+" 23:59:59").getTime();
                }

                var startTimeStamp = seed.startTime ? new Date(seed.startTime + " 00:00:00").getTime() : new Date(_start_ym+"-01 00:00:00").getTime();
                var endTimeStamp = seed.stopDate ? new Date(seed.stopDate + " 23:59:59").getTime() : new Date(_end_ym+"-31 23:59:59").getTime();

                if(startTime == "undefined" && stopTime == "undefined"){
                    nut.model.startDate = _start_ym;
                    nut.model.stopDate = _end_ym;
                }else{
                    nut.model.startDate = startTime
                    nut.model.stopDate = stopTime
                }

                this.step(function(){

                    if(startTime != "undefined" && stopTime != "undefined"){
                        nut.model.startDate = startTime;
                        nut.model.stopDate = stopTime;
                    }else{
                        nut.model.startDate = new Date(startTimeStamp+60*60*8*1000).toISOString().substr(0,10)
                        nut.model.stopDate = new Date(endTimeStamp+60*60*8*1000).toISOString().substr(0,10)
                    }
                })
                var finishMan=[];
                try{
                    if(seed.startTime && seed.stopDate){
                        then.step(function(){
                            helper.db.coll("lavico/custReceive").find(
                                {$and:[
                                    {
                                        themeId:helper.db.id(_id),
                                        isFinish:true,
                                        "type":"0"
                                    }
                                ]}
                            ).toArray(then.hold(function(err,doc){
                                    for(var i=0;i<doc.length;i++){
                                        var manInfo={};
                                        manInfo.createTime = formatTime(doc[i].createTime)
                                        manInfo.name=doc[i].wechatid;
                                        finishMan.push(manInfo);
                                    }
                                }))
                        });
                    }else{
                        then.step(function(){
                            helper.db.coll("lavico/custReceive").find(
                                {$and:[
                                    {
                                        themeId:helper.db.id(_id),
                                        isFinish:true,
                                        "type":"0"
                                    },
                                    {$or:[
                                        {"createTime":{$gte:startTime,$lte:stopTime}},
                                        {"createTime":{$gte:startDate,$lte:endTime}}
                                    ]}
                                ]}
                            ).toArray(then.hold(function(err,doc){
                                    for(var i=0;i<doc.length;i++){
                                        var manInfo={};
                                        manInfo.createTime = formatTime(doc[i].createTime)
                                        manInfo.name=doc[i].wechatid;
                                        finishMan.push(manInfo);
                                    }
                                }))
                        });
                    }


                    then.step(function(){
                        for(var i=0;i<finishMan.length;i++){
                            (function(i){
                                helper.db.coll("lavico/custReceive").find({themeId:helper.db.id(_id),isFinish:true,wechatid:finishMan[i].name,"type":{$ne:"0"}})
                                    .toArray(then.hold(function(err,doc){

                                        for(var j=0;j<finishMan.length;j++){
                                            if(finishMan[j].name==doc[0].wechatid){
                                                finishMan[j].getLabel=doc[0].getLabel
                                                finishMan[j].getGift=doc[0].getGift
                                                finishMan[j].compScore=doc[0].getScore;
                                                finishMan[j].customerLabel=doc[0].customerLabel || "--";

                                                (function(j){
                                                    helper.db.coll("welab/customers").findOne({"wechatid":finishMan[j].name},then.hold(function(err,doc){
                                                        if(err) throw err
                                                        if(doc){
                                                             finishMan[j].realname=doc.realname
                                                             finishMan[j].gender = doc.gender
                                                             finishMan[j].birthday=doc.birthday
                                                             finishMan[j].city=doc.city
                                                        }
                                                    }))
                                                })(j)
                                            }
                                        }
                                    }))
                            })(i)
                        }
                    });

                    this.step(function(){
                        var i = 0, len = finishMan.length,
                            j, d;
                        for(; i<len; i++){
                            for(j=0; j<len; j++){
                                if(finishMan[i].createTime > finishMan[j].createTime){
                                    d = finishMan[j];
                                    finishMan[j] = finishMan[i];
                                    finishMan[i] = d;
                                }
                            }
                        }
                    })

                    then.step(function(){
                        pageSize=10
                        page={}
                        page.lastPage=finishMan.length%pageSize==0 ? parseInt(finishMan.length/pageSize) : parseInt(finishMan.length/pageSize)+1;
                        page.currentPage = typeof(seed.page)=="undefined"?1:parseInt(seed.page);
                        page.totalCount=finishMan.length;
                        var data=[];

                        for(var j=(page.currentPage-1)*pageSize;j<(page.currentPage-1)*pageSize+pageSize;j++){
                                if(typeof finishMan[j] !='undefined'){
                                    data.push(finishMan[j])
                                }
                        }
                        nut.model.page=page || {};
                        for(var _i=0;_i<data.length;_i++){
                            data[_i].realname =data[_i].realname || "姓名不详";
                            data[_i].getLabel = data[_i].getLabel || "暂无";
                            data[_i].getGift = data[_i].getGift || "暂无";
                            data[_i].compScore = data[_i].compScore || "暂无";
                            data[_i].createTime = formatTime(data[_i].createTime) || null;
                            data[_i].gender = sex(data[_i].gender) || null;
                            if(data[_i].birthday){
                                data[_i].birthday = year(data[_i].birthday);
                            }else{
                                data[_i].birthday = "";
                            }
                            data[_i].city = data[_i].city || "暂无";

                        }
                        nut.model.data=data;

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

                $('#startDate').datetimepicker({
                    format: 'yyyy-mm-dd',
                    autoclose: true,
                    minView: 2
                })

                $('#stopDate').datetimepicker({
                    format: 'yyyy-mm-dd',
                    autoclose: true,
                    minView: 2
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
                var newArr=[];
                then.step(function(){
                    helper.db.coll("lavico/themeQuestion").findOne({_id:helper.db.id(_id)},then.hold(function(err,doc){
                        if(err) throw err;
                        docs_themeQuestion2=doc;

                    }))
                });

                this.step(function(){
                    var showtype = -1;
                    if(seed.themetype == 3){
                        showtype = docs_themeQuestion2.showtype;
                    }
                    nut.model.showtype = showtype;
                })

                this.step(function(){
                    if(docs_themeQuestion2){
                        this.step(function(){
                            for(var i=0;i<docs_themeQuestion2.scoreMinMax.length;i++){
                                var flag=true;
                                for(var j=0;j<newArr.length;j++){
                                    if(docs_themeQuestion2.scoreMinMax[i].getScore==newArr[j].getScore){
                                        flag=false;
                                        break;
                                    }
                                }
                                if(flag){
                                    var result={};
                                    result.getScore = docs_themeQuestion2.scoreMinMax[i].getScore;
                                    newArr.push(result);
                                }
                            }
                        })
                    }
                })


                then.step(function(){
                    if(newArr.length>0){
                        for(var i=0;i<newArr.length;i++){
                            var score = newArr[i].getScore;
                            (function(x,w){
                                helper.db.coll("lavico/custReceive").count({themeId:helper.db.id(_id),isFinish:true,getScore:x},
                                    then.hold(function(err,doc){
                                        if(err) throw err;
                                        w.sinScore=doc;
                                        all2+=doc;
                                    }))
                            })(score,newArr[i]);
                        }
                    }

//                    for(var i in docs_themeQuestion2.scoreMinMax){
//                        var score=docs_themeQuestion2.scoreMinMax[i].getScore;
//                        (function(x,w){
//                            helper.db.coll("lavico/custReceive").count({themeId:helper.db.id(_id),isFinish:true,getScore:x},
//                              then.hold(function(err,doc){
//                                if(err) throw err;
//                                w.sinScore=doc;
//                                all2+=doc;
//                            }))
//                        })(score,docs_themeQuestion2.scoreMinMax[i]);
//                    }
                });

                then.step(function(){
                    nut.model.docs_2=newArr || {}
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
                var all=0;
                var custReceive;
                then.step(function(){
                    helper.db.coll("lavico/themeQuestion").findOne({_id:helper.db.id(_id)},then.hold(function(err,doc){
                        if(err) throw err;
                        if(doc){
                            docs_themeQuestion=doc;
                        }
                    }))
                });

//                then.step(function(){
//                    console.log("1",docs_themeQuestion)
//                    if(docs_themeQuestion){
//                        helper.db.coll("lavico/custReceive").find({themeId:helper.db.id(_id),isFinish:true,"type":{$ne:"0"}})
//                            .toArray(function(err,doc){
//
//                                if(err) throw err;
//                                var xinArr=[];
//                                if(doc){
//                                    for(var i in docs_themeQuestion.scoreMinMax){
//                                        for(var j in doc){
//                                            if(docs_themeQuestion.scoreMinMax[i].conditionMinScore<=doc[j].getChooseScore &&
//                                                doc[j].getChooseScore<= docs_themeQuestion.scoreMinMax[i].conditionMaxScore){
//                                                if(docs_themeQuestion.scoreMinMax[i].sinCount){
//                                                    docs_themeQuestion.scoreMinMax[i].sinCount++;
//                                                }else{
//                                                    docs_themeQuestion.scoreMinMax[i].sinCount=1;
//                                                }
//                                                all++;
//                                            }
//                                        }
//                                    }
//                                }
//
//
//                                nut.model.all = all||0;
//                            })
//                    }
//
//                })
                then.step(function(){
                    helper.db.coll("lavico/custReceive").find({"themeId":helper.db.id(_id),"isFinish":true,"type":{$ne:"0"}}).toArray(then.hold(function(err,doc){
                        if(err) throw  err;
                        if(doc){
                            custReceive = doc;
                        }
                    }))
                })

                then.step(function(){
                    if(custReceive && docs_themeQuestion){
                        for(var i=0;i<docs_themeQuestion.scoreMinMax.length;i++){
                            for(var j=0;j<custReceive.length;j++){
                                if(docs_themeQuestion.scoreMinMax[i].conditionMinScore<=custReceive[j].getChooseScore &&
                                    custReceive[j].getChooseScore<= docs_themeQuestion.scoreMinMax[i].conditionMaxScore){
                                    if(docs_themeQuestion.scoreMinMax[i].sinCount){
                                        docs_themeQuestion.scoreMinMax[i].sinCount++;
                                    }else{
                                        docs_themeQuestion.scoreMinMax[i].sinCount=1;
                                    }
                                    all++;
                                }
                            }
                        }
                    }
                })

                then.step(function(){
                    nut.model.docs_1 =docs_themeQuestion|| {};
                    nut.model.all = all||0;
                })
            }
        },
        customerLabel:{
            view:"lavico/templates/answerQuestion/statistics/customerLabel.html",
            process:function(seed,nut){
                var then=this;
                var docs_themeQuestion
                var _id=seed._id;
                var all=0;
                var custReceive;
                then.step(function(){
                    helper.db.coll("lavico/themeQuestion").findOne({_id:helper.db.id(_id)},then.hold(function(err,doc){
                        if(err) throw err;
                        if(doc){
                            docs_themeQuestion=doc;
                        }
                    }))
                });

                then.step(function(){
                    helper.db.coll("lavico/custReceive").find({"themeId":helper.db.id(_id),"isFinish":true,"type":{$ne:"0"}}).toArray(then.hold(function(err,doc){
                        if(err) throw  err;
                        if(doc){
                            custReceive = doc;
                        }
                    }))
                })

                var themeQuestion_list = [];
                then.step(function(){
                    if(docs_themeQuestion){
                        for(var i=0;i<docs_themeQuestion.options.length;i++){
                            if(docs_themeQuestion.options[i].choose){
                                for(var j=0;j<docs_themeQuestion.options[i].choose.length;j++){
                                    var list = {};
                                    list.customerLabel = docs_themeQuestion.options[i].choose[j].customerLabel || "--";
                                    list.count = 0;
                                    themeQuestion_list.push(list)
                                }
                            }
                        }
                    }
                })

                then.step(function(){
                    for(var i=0;i<themeQuestion_list.length;i++){
                        for(var k=0;k<custReceive.length;k++){
                            if(custReceive[k].customerLabel){
                                var customerLabelList = custReceive[k].customerLabel.split(",");
                                for(var j = 0;j<customerLabelList.length;j++){
                                    if(customerLabelList[j] && customerLabelList[j]==themeQuestion_list[i].customerLabel){
                                        all++;
                                        themeQuestion_list[i].count +=1;
                                    }

                                }
                            }
                        }
                    }
                })

                then.step(function(){
                    console.log("all",all)
                    nut.model.docs_1 =themeQuestion_list|| {};
                    nut.model.all = all||0;
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
function   formatTime(now){
    var   now = new Date(now);
    var   year=now.getFullYear();
    var   month=(now.getMonth()+1>9)?(now.getMonth()+1):('0'+(now.getMonth()+1));
    var   date=(now.getDate()>9)?now.getDate():('0'+now.getDate());
    var   hour=(now.getHours()>9)?now.getHours():('0'+now.getHours());
    var   minute=(now.getMinutes()>9)?now.getMinutes():('0'+now.getMinutes());
    var   second=(now.getSeconds()>9)?now.getSeconds():('0'+now.getSeconds());
    return   year+"-"+month+"-"+date;
}

function sex(sex){
    if(typeof (sex)!="undefined"){
        if(sex=="male"){
            return "男";
        }
        if(sex=="female"){
            return "女";
        }
    }else{
        return "性别不详";
    }
}

function year(time){
    if(typeof (time)!="undefined" ){
        var   now = new Date(time);
        var   year=now.getFullYear();

        var date=new Date;
        var years=date.getFullYear();
        var sa = parseInt(years) -year;
        return sa || "0";
    }else{
        return "年龄不详";
    }
//    var   now = new Date(now);
//    var   year=now.getFullYear();
//    var   month=(now.getMonth()+1>9)?(now.getMonth()+1):('0'+(now.getMonth()+1));
//    var   date=(now.getDate()>9)?now.getDate():('0'+now.getDate());
//    var   hour=(now.getHours()>9)?now.getHours():('0'+now.getHours());
//    var   minute=(now.getMinutes()>9)?now.getMinutes():('0'+now.getMinutes());
//    var   second=(now.getSeconds()>9)?now.getSeconds():('0'+now.getSeconds());
//    return   year;
}