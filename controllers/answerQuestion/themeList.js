//http://{host}/lavico/answerQuestion/answer?_id=5335249d1576b3bd27000c72&optionId=1&wechatid={wxid}
module.exports={
	layout:"welab/Layout",
    view:"lavico/templates/answerQuestion/themeList.html",
    	process:function(seed,nut){
            then = this;
            this.req.session.scoreAll=0;
            var partakeCount=new Array();
            var finishCount=new Array();
            var resultList;
            var themetype = seed.themetype ? seed.themetype : 0;
            this.step(function(){
                if(themetype==1){
                    helper.db.coll("lavico/themeQuestion").find({themeType:1}).toArray(this.hold(function(err,docs){
                        if(err) throw  err;
                        return docs;
                    }))
                }else{
                    helper.db.coll("lavico/themeQuestion").find({themeType:{$ne:1}}).toArray(this.hold(function(err,docs){
                        if(err) throw  err;
                        return docs;
                    }))
                }
            })
            //从数据库查找数据,并组织为Model
            this.step(function(cursor){
                for(var i=0;i<cursor.length;i++){
                /*
                * *hold只能完成终止下一个step.在当前step中同步操作需要闭包来封装，因为node的回调函数是异步的
                * */
                    (function(i){
                        helper.db.coll("lavico/custReceive").aggregate([
                            {$group:{_id:"$themeId",count:{$addToSet:"$memberId"}}},
                            {$match:{_id:helper.db.id(cursor[i]._id)}}
                        ],then.hold(function(err,doc){
                            if(err) throw err;
                                try{

                                    partakeCount[i]=doc[0].count.length;
                                }catch(e){

                                    partakeCount[i]=0;
                                }
                            }));
                            /*
                            helper.db.coll("lavico/custReceive").find({"themeId":helper.db.id(cursor[i]._id),"isFinish":false}).count(then.hold(function(err,doc){
                            //参与人数

                            partakeCount[i]=doc;
                            }));
                            */
                            helper.db.coll("lavico/custReceive").find({"themeId":helper.db.id(cursor[i]._id),"isFinish":true,"type":"0"}).count(then.hold(function(err,doc){
                            //完成人数
                            finishCount[i]=doc;
                        }));
                    })(i)
                }
            //}));
        });
        //
        this.step(function(){
            if(themetype==1){
                helper.db.coll("lavico/themeQuestion").find({themeType:1}).toArray(this.hold(function(err,themeQuestion){
                    if(err) throw  err;
                    return themeQuestion;
                }));
            }else{
                helper.db.coll("lavico/themeQuestion").find({themeType:{$ne:1}}).toArray(this.hold(function(err,themeQuestion){
                    if(err) throw  err;
                    return themeQuestion;
                }))
            }
        })

            this.step(function(themeQuestion){
                var reply="[";
                for(var i=0;i<themeQuestion.length;i++){
                    var json=JSON.stringify({
                        //标题
                        "theme":themeQuestion[i].theme,
                        //options的数量
                        "themeCount":themeQuestion[i].options.length,
                        //创建时间
                        "createTime":themeQuestion[i].createTime,
                        //参与人数
                        "partakeCount":partakeCount[i],
                        //完成人数
                        "finishCount":finishCount[i],
                        //标题ID
                        "_id":themeQuestion[i]._id
                    });
                    reply+=json;
                    if(i<themeQuestion.length-1){reply+=","}
                }
                reply+="]";
                resultList=eval('('+reply+')')
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
            nut.model.jsonReply=page.docs
        })
    }
}