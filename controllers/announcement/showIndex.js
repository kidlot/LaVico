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

        this.step(function(){

            helper.db.coll("welab/customers").findOne({"wechatid":wechatid},this.hold(function(err,doc){
                if(err) throw err;
                if(doc && doc.announcement){
                    announcement = doc.announcement;
                }else{
                    announcement="null";
                }

            }));
        })

        var newArr=[];
        this.step(function(doc){
            if(announcement!=null){
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
            var results=[];
            var docs=[];
            if(newArr.length>0){
                for(var i=0;i<newArr.length;i++){
                    for(var j=0;j<resultlist.length;j++){
                        var result={};
                        console.log("i:"+i)
                        console.log("j:"+j)
                        if(newArr[i]==resultlist[j]._id){
                            result._id = resultlist[j]._id;
                            result.title = resultlist[j].title;
                            result.createTime = resultlist[j].createTime;
                            result.read = "true";
                            results.push(result);
                        }
                    }
                }
                for(var )
            }else{
                for(var j=0;j<resultlist.length;j++){
                    var result={};
                    result._id = resultlist[j]._id;
                    result.title = resultlist[j].title;
                    result.createTime = resultlist[j].createTime;
                    result.read = "false";
                    docs.push(result);
                }
            }
            console.log(docs)
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