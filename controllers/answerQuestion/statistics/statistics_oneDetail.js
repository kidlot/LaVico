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

        seed["$visitedPartake"]={_id:themeId,optionId:optionId}

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
            nut.model.allPartakeNum=allPartakeNum
        })
    },
    children:{
        visitedPartake:{
            view:"lavico/templates/answerQuestion/statistics/statistics_visitedPartake.html",
            process:function(seed,nut){

                var then = this
                var visitedPeople
                var themeQuestionList = []
                var visitePeopleList=[]
                this.step(function(){
                    helper.db.coll("lavico/custReceive").aggregate(
                        [
                            {$match:{optionId:parseInt(seed.optionId),themeId:helper.db.id(seed._id)}},
                            {$group:{_id:{themeId:"$themeId",optionId:"$optionId"},count:{$addToSet:"$memberId"}}}
                        ],this.hold(function(err,doc){
                            if(err)throw err
                            if(doc!=""){
                                visitedPeople=doc[0].count
                            }else{

                                this.terminate();
                            }
                        })
                    )
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
                    for(var i in visitedPeople){
                        (function(i){
                            helper.db.coll("welab/customers").findOne({"HaiLanMemberInfo.memberID":parseInt(visitedPeople[i])},then.hold(function(err,doc){
                                if(err)throw err
                                if(doc){
                                    var visiPeople={}
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
                    console.log("visitePeopleList",visitePeopleList.length)
                    var docs=[];
                    console.log("page",seed.page)
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
            }
        }
    },
    actions:{
        exportXsl:{
            view:null,
            process:function(seed,nut){
                var then = this
                var visitedPeople
                var visitePeopleList=[]
                this.step(function(){
                    helper.db.coll("lavico/custReceive").aggregate(
                        [
                            {$match:{optionId:1,themeId:helper.db.id(seed._id)}},
                            {$group:{_id:{themeId:"$themeId",optionId:"$optionId"},count:{$addToSet:"$wechatid"}}}
                        ],this.hold(function(err,doc){
                            if(err)throw err

                            visitedPeople=doc[0].count
                        })
                    )
                })

                this.step(function(){
                    for(var i in visitedPeople){
                        (function(i){
                            helper.db.coll("welab/customers").findOne({wechatid:visitedPeople[i]},then.hold(function(err,doc){
                                if(err)throw err
                                if(doc){
                                    var visiPeople={}
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

                    for(var i in visitePeopleList){
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