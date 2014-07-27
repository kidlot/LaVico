/**
 * Created by alee on 14-7-27.
 */
module.exports = {
    layout: "welab/Layout",
    view: "lavico/templates/bargain/categorys/Catlist.html",
    process: function (seed, nut) {

    },
    children:{
        page:{
            layout:"welab/Layout",
            view:"lavico/templates/bargain/categorys/Catpage.html",
            process:function(seed,nut){
                var catslist = [];
                var bargainid;
                this.step(function(){
                    helper.db.coll("lavico/bargain/categorys").find({}).sort({createTime:-1}).toArray(this.hold(function(err,docs){
                        if(err) throw  err;
                        if(docs){
                            catslist = docs || {};
                        }
                    }))
                })

                this.step(function(){
                    pageSize=10
                    var data=[];
                    page={}
                    page.lastPage=catslist.length%pageSize==0 ? parseInt(catslist.length/pageSize) : parseInt(catslist.length/pageSize)+1;
                    page.currentPage=typeof(seed.page)=="undefined"?1:parseInt(seed.page);
                    page.totalCount=catslist.length

                    for(var j=(page.currentPage-1)*pageSize;j<(page.currentPage-1)*pageSize+pageSize;j++){
                        if(typeof(catslist[j])!="undefined")
                            data.push(catslist[j])
                    }
                    this.step(function(){
                        for(var i=0;i<data.length; i++){
                            data[i].createTime = createTime(data[i].createTime);
                            var num = 0;//完成人数
                            var count = 0;//参加人数
                            // 添加侃价分类统计
                            (function(then,data,i){
                                var condition = {'categoryId':data[i]._id};
                                helper.db.coll("lavico/bargain").find(condition,{"orderId":1}).toArray(then.hold(function(err,doc){
                                    if(err){
                                        throw err;
                                    }else{
                                        var bargain = doc;
                                        data[i].bargain = bargain;
                                    }
                                }))
                            })(this,data,i);

                            // 添加侃价分类统计
                        }

                    });
                    this.step(function(){

                        helper.db.coll("lavico/bargain").find({},{"orderId":1}).toArray(this.hold(function(err,doc){
                            if(err){
                                throw err;
                            }else{
                                bargainid = doc;
                            }
                        }))
                    })
                    this.step(function(){
                        helper.db.coll("lavico/user/logs").find({"action":"侃价"}).toArray(then.hold(function(err,doc){
                            if(err){
                                throw err;
                            }
                            if(doc){
                                for(var h=0;h<bargainid.length;h++){
                                    var num=0;
                                    for(var j=0;j<doc.length;j++){
                                        if(doc[j].data && doc[j].data.productID && doc[j].data.step && doc[j].data.stat &&  doc[j].data.step == 4 && doc[j].data.stat==true){
                                            if(bargainid[h]._id==doc[j].data.productID){
                                                num++;
                                                logs={};
                                                logs.productID = doc[j].data.productID;
                                                logs.num = num;
                                                userlogs.push(logs);
                                            }
                                        }
                                    }
                                }
                            }
                        }))
                    })

                    nut.model.data = data;
                    nut.model.page=page || {};
                })
            }
        }
    },
    actions:{
        del:{
            process:function(seed,nut){
                helper.db.coll("lavico/bargain/categorys").remove({_id:helper.db.id(seed.id)},this.hold(function(err,doc){
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
