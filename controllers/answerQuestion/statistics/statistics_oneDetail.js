module.exports={
    layout: "welab/Layout",
    view:"lavico/templates/answerQuestion/statistics/statistics_oneDetails.html",
    process:function(seed,nut){
        var then=this;
        var themeId=seed.themeId
        var optionId=seed.optionId
        var resultJson
        var allPartakeNum=0;
        var themetype = seed.themetype ? seed.themetype : 0;
        nut.model.themetype = themetype;

        var startTime = seed.startTime;
        var stopDate = seed.stopDate;

        seed["$visitedPartake"]={_id:themeId,optionId:optionId,startTime:startTime,stopDate:stopDate}

        then.step(function(){
            helper.db.coll("lavico/themeQuestion").findOne({_id:helper.db.id(themeId)},then.hold(function(err,doc){
                if(err) throw err
                if(doc)
                    for(var i in doc.options){
                        if(doc.options[i].optionId==optionId){
                            resultJson=doc.options[i]
                        }
                    }
            }))
        })

        then.step(function(){
            for(var i in resultJson.choose){
                (function(i,resultJsonChoose){
                    helper.db.coll("lavico/custReceive").count({
                        "themeId":helper.db.id(themeId),
                        "optionId":resultJson.optionId,
                        "chooseId":parseInt(i)
                    },then.hold(function(err,doc){
                        if(err) throw err
                        allPartakeNum+=doc
                        resultJsonChoose.selectCount=doc
                    }))
                })(i,resultJson.choose[i])
            }
        })

        then.step(function(){
            nut.model.resultJson=resultJson
            nut.model.themeId = themeId;
            nut.model.optionId = optionId;
            console.log("resultJson",resultJson.choose)
            nut.model.allPartakeNum=allPartakeNum
        })
    },
    children:{
        visitedPartake:{
            view:"lavico/templates/answerQuestion/statistics/statistics_visitedPartake.html",
            process:function(seed,nut){

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


                var then = this
                var visitedPeople=[];
                var themeQuestionList = []
                var visitePeopleList=[]
                this.step(function(){
                    helper.db.coll("lavico/custReceive").find(
                        {$and:[
                            {
                                themeId:helper.db.id(seed._id),
                                isFinish:false,
                                "type":"0",
                                "optionId":parseInt(seed.optionId)
                            },
                            {$or:[
                                {"createTime":{$gte:startTime,$lte:stopTime}},
                                {"createTime":{$gte:startDate,$lte:endTime}}
                            ]}
                        ]}
                    ).toArray(this.hold(function(err,doc){
                        if(err) console.log(err);
                        if(doc.length>0){
                            for(var i=0;i<doc.length;i++){
                                var visite={};
                                visite.createTime = formatTime(doc[i].createTime);
                                visite.wechatid = doc[i].wechatid;
                                visitedPeople.push(visite);
                            }
                        }
                    }))
                })

                this.step(function(){
                    var i = 0, len = visitedPeople.length,
                        j, d;
                    for(; i<len; i++){
                        for(j=0; j<len; j++){
                            if(visitedPeople[i].createTime > visitedPeople[j].createTime){
                                d = visitedPeople[j];
                                visitedPeople[j] = visitedPeople[i];
                                visitedPeople[i] = d;
                            }
                        }
                    }
                })

                this.step(function(){
                    helper.db.coll("lavico/themeQuestion").findOne({_id:helper.db.id(seed._id)},this.hold(function(err,doc){
                        if(err){
                            throw err
                        }
                        var themeQuestion = {}
                        themeQuestion.themeType = doc.themeType
                        themeQuestionList.push(themeQuestion)
                        nut.model.theme = doc.options

                    }))
                })

                this.step(function(){
                    for(var i=0;i<visitedPeople.length;i++){
                        (function(i){
                            helper.db.coll("welab/customers").findOne({"wechatid":visitedPeople[i].wechatid},then.hold(function(err,doc){
                                if(err)throw err
                                if(doc){
                                    var visiPeople={}
                                    visiPeople.createtime =visitedPeople[i].createTime;
                                    visiPeople.realname=doc.realname
                                    visiPeople.gender=doc.gender
                                    visiPeople.mobile=doc.mobile
                                    visiPeople.email=doc.email
                                    visiPeople.profession=doc.profession
                                    visiPeople.city=doc.city
                                    visitePeopleList.push(visiPeople)
                                }
                            }))
                        })(i)
                    }
                })
                this.step(function(){
                    var docs=[];
                    pageSize=10
                    page={}
                    page.lastPage=visitePeopleList.length%pageSize==0 ? parseInt(visitePeopleList.length/pageSize) : parseInt(visitePeopleList.length/pageSize)+1;
                    page.currentPage=typeof(seed.page)=="undefined"?1:seed.page
                    page.totalCount=visitePeopleList.length
                    page.docs=[]

                    for(var j=(page.currentPage-1)*pageSize;j<(page.currentPage-1)*pageSize+pageSize;j++){
                        if(typeof(visitePeopleList[j])!="undefined")
                            docs.push(visitePeopleList[j])
                    }
                    nut.model.page = page;
                    nut.model.visitedPeopleList=docs
                    nut.model._id=seed._id
                    nut.model.optionId=seed.optionId
                })
            },viewIn:function(){
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
        }
    },
    actions:{
        exportXsl:{
            view:null,
            process:function(seed,nut){
                var then = this
                var visitedPeople=[];
                var visitePeopleList=[]
                this.step(function(){

                    helper.db.coll("lavico/custReceive").find({themeId:helper.db.id(seed._id),isFinish:false,"type":"0","optionId":parseInt(seed.optionId)}).toArray(this.hold(function(err,doc){
                        if(err) console.log(err);
                        if(doc.length>0){
                            for(var i=0;i<doc.length;i++){
                                var visite={};
                                visite.createTime = formatTime(doc[i].createTime);
                                visite.wechatid = doc[i].wechatid;
                                visitedPeople.push(visite);
                            }
                        }
                    }))
                })

                this.step(function(){
                    var i = 0, len = visitedPeople.length,
                        j, d;
                    for(; i<len; i++){
                        for(j=0; j<len; j++){
                            if(visitedPeople[i].createTime > visitedPeople[j].createTime){
                                d = visitedPeople[j];
                                visitedPeople[j] = visitedPeople[i];
                                visitedPeople[i] = d;
                            }
                        }
                    }
                })

                this.step(function(){
                    for(var i=0;i<visitedPeople.length;i++){
                        (function(i){
                            helper.db.coll("welab/customers").findOne({wechatid:visitedPeople[i].wechatid},then.hold(function(err,doc){
                                if(err)throw err
                                if(doc){
                                    var visiPeople={}
                                    visiPeople.createtime =visitedPeople[i].createTime;
                                    visiPeople.realname=doc.realname
                                    visiPeople.gender=doc.gender
                                    visiPeople.mobile=doc.mobile
                                    visiPeople.email=doc.email
                                    visiPeople.profession=doc.profession
                                    visiPeople.city=doc.city
                                    visitePeopleList.push(visiPeople)
                                }
                            }))
                        })(i)
                    }
                })

                this.step(function(){
                    var nodeExcel = require('excel-export');
                    var conf = {};
                    conf.cols = [
                        {
                            caption: '时间',
                            type: 'string'
                        },
                        {
                            caption: '用户姓名',
                            type: 'string'
                        }, {
                            caption: '性别',
                            type: 'string'
                        }, {
                            caption: '电话',
                            type: 'string'
                        }, {
                            caption: 'email',
                            type: 'string'
                        }, {
                            caption: '行业',
                            type: 'string'
                        }, {
                            caption: '城市',
                            type: 'string'
                        }
                    ]

                    conf.rows = []
                    for(var i=0;i<visitePeopleList.length;i++){
                        var rows
                        var realname
                        if(typeof (visitePeopleList[i].realname)=="undefined"){
                            realname=""
                        }else{
                            realname= visitePeopleList[i].realname
                        }
                        var email
                        if(typeof (visitePeopleList[i].email)=="undefined"){
                            email=""
                        }else{
                            email= visitePeopleList[i].email
                        }
                        var profession
                        if(typeof (visitePeopleList[i].profession)=="undefined"){
                            profession=""
                        }else{
                            profession= visitePeopleList[i].profession
                        }
                        var gender
                        if(visitePeopleList[i].gender=="female"){
                            gender="女"
                        }else{
                            gender= "男"
                        }

                        var city
                        if(typeof (visitePeopleList[i].city)=="undefined"){
                            city=""
                        }else{
                            city= visitePeopleList[i].city
                        }

                        rows = [
                            visitePeopleList[i].createtime,
                            realname,
                            gender,
                            visitePeopleList[i].mobile,
                            email,
                            profession,
                            city
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