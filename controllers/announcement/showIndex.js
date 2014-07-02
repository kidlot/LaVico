/*
 author:json
 description:get announcement list(获取公告信息列表)
 */
module.exports={
    //view:"lavico/templates/announcement/showIndex.html",
    layout:"lavico/layout",
    view:"lavico/templates/announcement/member_num13.html",
    process:function(seed,nut){
        var wechatid= seed.wxid ? seed.wxid : 'undefined'
        nut.model.wxid = seed.wxid ? seed.wxid : 'undefined'
        var announcement;
        var resultlist;
        var then = this;

        this.step(function(){

            helper.db.coll("welab/customers").findOne({"wechatid":wechatid},this.hold(function(err,doc){
                if(err) throw err;
                if(doc && doc.announcement){
                    announcement = doc.announcement;
                }

            }));
        })

        var newArr=[];
        this.step(function(doc){
            if(typeof(announcement)!="undefined"){
                for(var i=0;i<announcement.length;i++){
                    var flag=true;
                    for(var j=0;j<newArr.length;j++){
                        if(announcement[i]==newArr[j]){
                            flag=false;
                            break;
                        }
                    }
                    if(flag){
                        newArr.push(announcement[i])
                    }
                }
                console.log(newArr)
            }
        })

        this.step(function(){
            helper.db.coll("lavico/announcement").find({isOpen:true}).sort({"createTime":-1}).toArray(this.hold(function(err,doc){
                if(err) throw err;
                resultlist = doc;
            }));
        })

        this.step(function(){
            var docs=[];
            if(newArr.length>0){
                for(var j=0;j<resultlist.length;j++){
                    for(var i=0;i<newArr.length;i++){
                        if(newArr[i]==resultlist[j]._id){
                            resultlist[j].read="true";
                        }
                    }
                }
                for(var j=0;j<resultlist.length;j++){
                    if(resultlist[j].read && resultlist[j].read=="true"){
                        var result={};
                        result._id = resultlist[j]._id;
                        result.title = resultlist[j].title;
                        result.createTime = resultlist[j].createTime;
                        result.read = resultlist[j].read
                        docs.push(result);
                    }else{
                        var result={};
                        result._id = resultlist[j]._id;
                        result.title = resultlist[j].title;
                        result.createTime = resultlist[j].createTime;
                        result.read ="false"
                        docs.push(result);
                    }
                }
            }else{
                for(var j=0;j<resultlist.length;j++){
                    var results={};
                    results._id = resultlist[j]._id;
                    results.title = resultlist[j].title;
                    results.createTime = resultlist[j].createTime;
                    results.read = "false";
                    docs.push(results);
                }
            }
            nut.model.docs = docs;
        })

    },
    actions:{
        show:{
            layout:"lavico/layout",
            view:"lavico/templates/announcement/member_num14.html",
            process:function(seed,nut){
                nut.model.wxid=seed.wxid;
                this.step(function(){
                    helper.db.coll("welab/customers").update({"wechatid":seed.wxid}, {$addToSet:{announcement:seed._id}},this.hold(function(err,doc){
                        if(err ){
                            throw err;
                        }
                    }));
                })

                this.step(function(){
                    helper.db.coll("lavico/announcement").findOne({_id:helper.db.id(seed._id)},this.hold(function(err,doc){
                        if(err) throw err;
                        nut.model.doc=doc;
                    }));
                })

            }
        }
    }
}