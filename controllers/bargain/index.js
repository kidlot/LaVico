module.exports = {
	layout: "welab/Layout",
    view: "lavico/templates/bargain/index.html",
    process: function(seed,nut){
        var bargainid;
        var custlist=[];
        var list = {};
        var userlogs=[];
        var then = this;
        this.step(function(){
            helper.db.coll("lavico/bargain").find({},{"_id":1}).toArray(this.hold(function(err,doc){
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

        this.step(function(){
            helper.db.coll("lavico/bargain").find({}).sort({createTime:-1}).page(50,seed.page||1,this.hold(function(err,page){
                list = page
                for (var i=0;i<page.docs.length;i++){
                    if(page.docs[i].switcher == "off"){
                        page.docs[i].stat = "已关闭"
                    }else if(new Date().getTime() < page.docs[i].startDate){
                        page.docs[i].stat = "未开始"
                    }else if(new Date().getTime() > page.docs[i].stopDate){
                        page.docs[i].stat = "已结束"
                    }else{
                        page.docs[i].stat = "进行中"
                    }
                    for(var j=0;j<userlogs.length;j++){
                        if(page.docs[i]._id==userlogs[j].productID){
                            list.docs[i].num = userlogs[j].num;
                        }
                    }
                    if(!page.docs[i].switcher){
                        page.docs[i].switcher="off";
                    }
                    //排序
                    page.docs[i].orderId = page.docs[i].orderId || (i+1);
                }
            }));
        })

        this.step(function(){

            console.log(list);
            nut.model.page = list;
        })
    },
    viewIn:function(){

        //排序
        $("#tagList>tbody").dragsort({ dragSelector: "tr", dragEnd: saveOrder, placeHolderTemplate: "<tr class='placeHolder'><td colspan='6'></td></tr>" });

        function saveOrder() {
            var data = $("#tagList tr").map(function() { return $(this).data("itemid"); }).get();
            console.log(data);
            $.post("/lavico/bargain/index:updateListOrder", { "orderIds": data });
        };
    },
    actions:{
        updateListOrder:function(seed,nut){

            console.log(seed.orderIds);

            var orderIds = seed.ordeIds;

//            helper.db.coll("lavico/bargain").find({}).sort({orderId:-1}).page(50,seed.page||1,this.hold(function(err,page){
//                list = page
//                for (var i=0;i<page.docs.length;i++){
//                    page.docs[i].orderId = orderIds[i];
//                }
//            }));

        }

    }
}







