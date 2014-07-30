module.exports = {
    layout: "welab/Layout",
    view: "lavico/templates/tags/Taglist.html",
    process: function (seed, nut) {

    },
    children:{
        page:{
            layout:"welab/Layout",
            view:"lavico/templates/tags/Tagpage.html",
            process:function(seed,nut){
                var tagslist = [];
                this.step(function(){
                    helper.db.coll("lavico/tags").find({}).sort({createTime:-1}).toArray(this.hold(function(err,docs){
                        if(err) throw  err;
                        if(docs){
                            tagslist = docs || {};
                        }
                    }))
                })

                this.step(function(){
                    pageSize=10
                    var data=[];
                    page={}
                    page.lastPage=tagslist.length%pageSize==0 ? parseInt(tagslist.length/pageSize) : parseInt(tagslist.length/pageSize)+1;
                    page.currentPage=typeof(seed.page)=="undefined"?1:parseInt(seed.page);
                    page.totalCount=tagslist.length

                    for(var j=(page.currentPage-1)*pageSize;j<(page.currentPage-1)*pageSize+pageSize;j++){
                        if(typeof(tagslist[j])!="undefined")
                            data.push(tagslist[j])
                    }

                    for(var i=0;i<data.length; i++){
                        data[i].createTime = formatTime(data[i].createTime);
                    }

                    nut.model.data = data;
                    nut.model.page=page || {};
                })
            }
        }
    },
    actions:{
        del:{
            process:function(seed,nut){
                helper.db.coll("lavico/tags").remove({_id:helper.db.id(seed.id)},this.hold(function(err,doc){
                    if(err) throw err;
                    if(doc){
                        nut.message("删除成功",null,'success') ;
                    }else{
                        nut.message("删除失败",null,'error') ;
                    }
                }));
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
