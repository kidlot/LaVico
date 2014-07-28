module.exports = {
    layout: "welab/Layout",
    view: "lavico/templates/users/userlist.html",
    process: function (seed, nut) {

    },
    children:{
        page:{
            layout:"welab/Layout",
            view:"lavico/templates/users/userpage.html",
            process:function(seed,nut){
                var userlist = [];
                this.step(function(){
                    helper.db.coll("ocuser/users").find({}).sort({createTime:-1}).toArray(this.hold(function(err,docs){
                        if(err) throw  err;
                        if(docs){
                            userlist = docs || {};
                        }
                    }))
                })

                this.step(function(){
                    pageSize=10
                    var data=[];
                    page={}
                    page.lastPage=userlist.length%pageSize==0 ? parseInt(userlist.length/pageSize) : parseInt(userlist.length/pageSize)+1;
                    page.currentPage=typeof(seed.page)=="undefined"?1:parseInt(seed.page);
                    page.totalCount=userlist.length

                    for(var j=(page.currentPage-1)*pageSize;j<(page.currentPage-1)*pageSize+pageSize;j++){
                        if(typeof(userlist[j])!="undefined")
                            data.push(userlist[j])
                    }

                    for(var i=0;i<data.length; i++){
                        data[i].createTime = createTime(new Date(data[i].createTime).getTime());
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
                helper.db.coll("ocuser/users").remove({_id:helper.db.id(seed.id)},this.hold(function(err,doc){
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
function createTime(){
    var d = new Date();
    var vYear = d.getFullYear();
    var vMon = d.getMonth() + 1;
    var vDay = d.getDate();
    s=vYear+"-"+(vMon<10 ? "0" + vMon : vMon)+"-"+(vDay<10 ? "0"+ vDay : vDay);
    return s;
}
