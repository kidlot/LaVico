module.exports={
    layout: "welab/Layout",
    view:"lavico/templates/answerQuestion/statistics/statistics_simpleList.html",
    process:function(seed,nut){
        var then=this
        var themeId=seed.themeId
        var optionId=seed.optionId
        var resultList

        this.step(function(){
            helper.db.coll("lavico/custAnswerResult").find({themeId:helper.db.id(themeId),optionId:parseInt(optionId)})
                .toArray(this.hold(function(err,doc){
                    if(err)throw err
                        resultList=doc;
                }))
        })

        this.step(function(){
            for(var i in resultList){
                (function(i){
                    helper.db.coll("welab/customers").findOne({wechatid:resultList[i].wechatid},then.hold(function(err,doc){
                        if(err)throw err
                        if(doc){
                            var visiPeople={}
                            visiPeople.realname=doc.realname
                            visiPeople.gender=doc.gender
                            visiPeople.mobile=doc.mobile
                            visiPeople.email=doc.email
                            visiPeople.profession=doc.profession
                            visiPeople.city=doc.city
                            resultList[i].peop=visiPeople
                        }
                    }))
                })(i)
            }
        })

        then.step(function(){
            pageSize=20
            page={}
            page.lastPage=resultList.length%pageSize==0 ? parseInt(resultList.length/pageSize) : parseInt(resultList.length/pageSize)+1;
            page.currentPage=typeof(seed.page)=="undefined"?1:seed.page
            page.totalCount=resultList.length
            page.docs=[]

            for(var j=(page.currentPage-1)*pageSize;j<(page.currentPage-1)*pageSize+20;j++){
                if(typeof(resultList[j])!="undefined")
                    page.docs.push(resultList[j])
            }
            nut.model.resultJson=page.docs
            nut.model.optionId=optionId
            nut.model._id=seed.themeId
        })
    },
    actions:{
        exportXsl:{
            process:function(seed,nut){
                var then=this
                var themeId=seed.themeId
                var optionId=seed.optionId
                var resultList

                this.step(function(){
                    helper.db.coll("lavico/custAnswerResult").find({themeId:helper.db.id(themeId),optionId:parseInt(optionId)})
                        .toArray(this.hold(function(err,doc){
                            if(err)throw err
                            resultList=doc;
                        }))
                })

                this.step(function(){
                    for(var i in resultList){
                        (function(i){
                            helper.db.coll("welab/customers").findOne({wechatid:resultList[i].wechatid},then.hold(function(err,doc){
                                if(err)throw err

                                if(doc){
                                    var visiPeople={}
                                    visiPeople.realname=doc.realname
                                    visiPeople.gender=doc.gender
                                    visiPeople.mobile=doc.mobile
                                    visiPeople.email=doc.email
                                    visiPeople.profession=doc.profession
                                    visiPeople.city=doc.city
                                    resultList[i].peop=visiPeople
                                }
                            }))
                        })(i)
                    }
                })

                //export xsl
                var nodeExcel = require('excel-export');
                var conf = {};
                conf.cols = [
                    {
                        caption: '姓名',
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
                ];
                conf.rows = [];
                for(var i in resultList){
                    var rows
                    rows = [
                        resultList[i].realname,
                        resultList[i].gender,
                        resultList[i].mobile,
                        resultList[i].email,
                        resultList[i].profession,
                        resultList[i].city
                    ]
                    conf.rows.push(rows)
                }

                var result = nodeExcel.execute(conf);
                this.res.setHeader('Content-Type', 'application/vnd.openxmlformats');
                this.res.setHeader("Content-Disposition", "attachment; filename=Report.xlsx");
                this.res.write(result, 'binary');
                return this.res.end();

            }
        }
    }
}
