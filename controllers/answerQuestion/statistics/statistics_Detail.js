module.exports={
    layout:"welab/Layout",
    view:"lavico/templates/answerQuestion/statistics/statistics_Detail.html",
    process:function(seed,nut){
        var then = this;
        var themeId = seed.themeId;
        var finishdoc=[];
        var no_finishdoc;
        var themetype = seed.themetype ? seed.themetype : 0;
        nut.model.themetype = themetype;

        //完成
        this.step(function(){
            helper.db.coll("lavico/custReceive").find({themeId:helper.db.id(themeId),isFinish:true,"type":"0"}).toArray(this.hold(function(err,doc){
                if(err) throw  err;
                if(doc){
                    for(var i=0;i<doc.length;i++){
                        if(doc[i].createTime.length>10){
                            doc[i].createTime =doc[i].createTime

                        }else{
                            doc[i].createTime = formatTime(doc[i].createTime)
                        }
                    }
                    finishdoc = doc;
                }
            }))
        })

        //参与
        this.step(function(){
            helper.db.coll("lavico/custReceive").find({themeId:helper.db.id(themeId),isFinish:false,"optionId":1}).toArray(this.hold(function(err,doc){
                if(err) throw  err;
                if(doc){
                    for(var i=0;i<doc.length;i++){
                        doc[i].createTime = formatTime(doc[i].createTime)
                    }
                    no_finishdoc = doc;
                }
            }))
        })

        var docs=[];
        var arr=[];
        var arr1=[];
        this.step(function(){
            for(var i=0;i<no_finishdoc.length;i++){
                year = no_finishdoc[i].createTime;
                fa=false;
                if(arr.length==0){
                    var yearJ={};
                    yearJ.year=year;
                    yearJ.count=1;
                    arr.push(yearJ);
                }else{
                    for(var j=0;j<arr.length;j++){
                        if(arr[j].year==year){
                            arr[j].count++;
                            fa=true;
                        }
                    }
                    if(!fa){
                        var yearJ={};
                        yearJ.year=year;
                        yearJ.count=1;
                        arr.push(yearJ);
                    }
                }
            }

            for(var i=0;i<finishdoc.length;i++){
                year = finishdoc[i].createTime;
                fa=false;
                if(arr1.length==0){
                    var yearJ={};
                    yearJ.year=year;
                    yearJ.count=1;
                    arr1.push(yearJ);
                }else{
                    for(var j=0;j<arr1.length;j++){
                        if(arr1[j].year==year){
                            arr1[j].count++;
                            fa=true;
                        }
                    }
                    if(!fa){
                        var yearJ={};
                        yearJ.year=year;
                        yearJ.count=1;
                        arr1.push(yearJ);
                    }
                }
            }

        })

        this.step(function(){
            for(var i=0;i<arr.length;i++){
                for(var j=0;j<arr1.length;j++){
                    if(arr[i].year == arr1[j].year){
                        var doc={};
                        doc.time = arr[i].year;
                        doc.finishcount = arr1[j].count;
                        doc.no_finish = arr[i].count;
                        docs.push(doc);
                    }
                }
            }

            for(var i=0;i<arr.length;i++){
                for(var j=0;j<arr1.length;j++){
                    if(arr[i].year != arr1[j].year){
                        var doc={};
                        doc.time = arr[i].year;
                        doc.finishcount = 0;
                        doc.no_finish = arr[i].count;
                        docs.push(doc);
                    }
                }
            }
        })

        //去除重复项
        var newArr=[];
        this.step(function(){
            for(var i=0;i<docs.length;i++){
                var flag=true;
                for(var j=0;j<newArr.length;j++){
                    if(docs[i].time==newArr[j].year){
                        flag=false;
                        break;
                    }
                }
                if(flag){
                    var sa={};
                    sa.year = docs[i].time;
                    sa.finishcount = docs[i].finishcount;
                    sa.no_finish = docs[i].no_finish;
                    newArr.push(sa);
                }
            }
        })

        //排序
        this.step(function(){
            var i = 0, len = newArr.length,
                j, d;
            for(; i<len; i++){
                for(j=0; j<len; j++){
                    if(newArr[i].year > newArr[j].year){
                        d = newArr[j];
                        newArr[j] = newArr[i];
                        newArr[i] = d;
                    }
                }
            }
        })

        this.step(function(){
            nut.model.newArr = newArr||{};
        })

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
