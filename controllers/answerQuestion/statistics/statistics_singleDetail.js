module.exports={
    layout:"welab/Layout",
    view:"lavico/templates/answerQuestion/statistics/statistics_singleDetail.html",
    process:function(seed,nut){
        var themetype = seed.themetype ? seed.themetype : 0;
        nut.model.themetype = themetype;
        nut.model.optionId = seed.optionId;
        nut.model.chooseID = seed.chooseID;
        nut.model.themeId = seed.themeId;
        seed["$singledetail"]= {themeId:seed.themeId,optionId:seed.optionId,chooseID:seed.chooseID}
    },
    children:{
        singledetail:{
            layout:"welab/Layout",
            view:"lavico/templates/answerQuestion/statistics/statistics_singleDetailPage.html",
            process:function(seed,nut){
                var themeId = seed.themeId;
                var optionId = seed.optionId;
                var chooseID = seed.chooseID;
                var custReceivelist;
                var then = this;
                var resultlist=[];

                this.step(function(){
                    helper.db.coll("lavico/custReceive").find({"themeId":helper.db.id(themeId),
                        "optionId":parseInt(optionId),"chooseId":parseInt(chooseID)}).toArray(this.hold(function(err,docs){
                            if(err) throw err;
                            custReceivelist = docs || {};
                        }))
                })

                this.step(function(){
                    for(var i=0;i<custReceivelist.length;i++){
                        (function(i){
                            helper.db.coll("welab/customers").findOne({"wechatid":custReceivelist[i].wechatid},then.hold(function(err,docs){
                                if(err) throw err;
                                if(docs){
                                    var list={};
                                    if(custReceivelist[i].createTime.length>10){
                                        list.createTime = custReceivelist[i].createTime;
                                    }else{
                                        list.createTime = formatTime(custReceivelist[i].createTime);
                                    }
                                    list.realname = docs.realname || "未知";
                                    list.gender=sex(docs.gender) || "未知";
                                    list.mobile=docs.mobile || "未知";
                                    list.email=docs.email || "未知";
                                    list.profession=docs.profession || "未知";
                                    list.city=docs.city || "未知";
                                    resultlist.push(list)
                                }
                            }))
                        })(i)
                    }
                })

                //排序
                this.step(function(){
                    console.log("custReceivelist",custReceivelist.length)
                    var i = 0, len = resultlist.length,
                        j, d;
                    for(; i<len; i++){
                        for(j=0; j<len; j++){
                            if(resultlist[i].createTime > resultlist[j].createTime){
                                d = resultlist[j];
                                resultlist[j] = resultlist[i];
                                resultlist[i] = d;
                            }
                        }
                    }
                })

                this.step(function(){
                    var docs=[];
                    pageSize=10
                    page={}
                    page.lastPage=resultlist.length%pageSize==0 ? parseInt(resultlist.length/pageSize) : parseInt(resultlist.length/pageSize)+1;
                    page.currentPage=typeof(seed.page)=="undefined"?1:seed.page
                    page.totalCount=resultlist.length
                    page.docs=[]

                    for(var j=(page.currentPage-1)*pageSize;j<(page.currentPage-1)*pageSize+pageSize;j++){
                        if(typeof(resultlist[j])!="undefined")
                            docs.push(resultlist[j])
                    }
                    nut.model.page = page;
                    nut.model.resultlist=docs;
                    nut.model.themeId = seed.themeId;
                    nut.model.optionId = seed.optionId;
                    nut.model.chooseID = seed.chooseID;
                })
            }
        }
    },
    actions:{
        exportXsl:{
            view:null,
            process:function(seed,nut){
                var themeId = seed.themeId;
                var optionId = seed.optionId;
                var chooseID = seed.chooseID;
                var custReceivelist;
                var then = this;
                var resultlist=[];

                this.step(function(){
                    helper.db.coll("lavico/custReceive").find({"themeId":helper.db.id(themeId),
                        "optionId":parseInt(optionId),"chooseId":parseInt(chooseID)}).toArray(this.hold(function(err,docs){
                            if(err) throw err;
                            custReceivelist = docs || {};
                        }))
                })

                this.step(function(){
                    for(var i=0;i<custReceivelist.length;i++){
                        (function(i){
                            helper.db.coll("welab/customers").findOne({"wechatid":custReceivelist[i].wechatid},then.hold(function(err,docs){
                                if(err) throw err;
                                if(docs){
                                    var list={};
                                    if(custReceivelist[i].createTime.length>10){
                                        list.createTime = custReceivelist[i].createTime;
                                    }else{
                                        list.createTime = formatTime(custReceivelist[i].createTime);
                                    }
                                    list.realname = docs.realname || "未知";
                                    list.gender=sex(docs.gender) || "未知";
                                    list.mobile=docs.mobile || "未知";
                                    list.email=docs.email || "未知";
                                    list.profession=docs.profession || "未知";
                                    list.city=docs.city || "未知";
                                    resultlist.push(list)
                                }
                            }))
                        })(i)
                    }
                })

                //排序
                this.step(function(){
                    var i = 0, len = resultlist.length,
                        j, d;
                    for(; i<len; i++){
                        for(j=0; j<len; j++){
                            if(resultlist[i].createTime > resultlist[j].createTime){
                                d = resultlist[j];
                                resultlist[j] = resultlist[i];
                                resultlist[i] = d;
                            }
                        }
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
                    for(var i=0;i<resultlist.length;i++){
                        var rows
                        rows = [
                            resultlist[i].createTime,
                            resultlist[i].realname,
                            resultlist[i].gender,
                            resultlist[i].mobile,
                            resultlist[i].email,
                            resultlist[i].profession,
                            resultlist[i].city
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