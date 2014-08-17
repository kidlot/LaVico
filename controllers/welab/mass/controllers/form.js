var search = require("./search.js") ;

module.exports = {

    layout: "welab/Layout", view: "welab/apps/mass/templates/form.html", process: function (seed, nut) {

    }, actions: {

        tagtoman: {

            process: function (seed, nut) {

                var res = {}
                nut.view.disable();


                this.step(function(){

                    // 查标签
                    helper.db.coll("welab/customers").aggregate([
                        {$match:{tags:seed.tag}},
                        {$group: {
                            _id: "$wechatid"
                        }}
                    ],this.hold(function(err,doc){

                        res = {err: 0, msg:doc.length};
                    }))

                })
                this.step(function(){

                    nut.disable();
                    var data = JSON.stringify(res);
                    this.res.writeHead(200, { 'Content-Type': 'application/json' });
                    this.res.write(data);
                    this.res.end();
                })

            }
        }
        ,selecttoman:{

            process: function (seed, nut) {

                var res = {}
                nut.view.disable();
                console.log('******************');
                console.log(seed.params);
                console.log('******************');

                var conditions = search.conditions(seed) ;
                var collCus = helper.db.coll("welab/customers") ;
                var collMsg = helper.db.coll("welab/messages") ;
                var collReply = helper.db.coll("welab/reply") ;
                var pg;

                var messageWhere = {replyFor:null}

                this.step(function(){


                    // 单独增加消息类型的搜索
                    if(conditions && (conditions['$or'])){

                        for(var i=0 ; i<conditions['$or'].length ; i++){

                            var _where = conditions['$or'][i]
                            if(_where['message.type']){
                                messageWhere.type = _where['message.type']
                                conditions['$or'].splice(i,1)
                            }
                        }

                        if(conditions['$or'].length == 0){
                            delete conditions['$or'];
                        }
                    }
                    if(conditions && (conditions['$and'])){

                        for(var i=0 ; i<conditions['$and'].length ; i++){

                            var _where = conditions['$and'][i]
                            if(_where['message.type']){
                                messageWhere.type = _where['message.type']
                                conditions['$and'].splice(i,1)
                            }
                        }

                        if(conditions['$and'].length == 0){
                            delete conditions['$and'];
                        }
                    }

                });

                this.step(function(){
                    collMsg.find(messageWhere).toArray(this.hold(function(err,doc){
                        if(doc){
                            res = {err: 0, msg:doc.length};
                        }else{
                            console.log(0);
                            res = {err: 0, msg:0};
                        }
                    }));
                });

//                this.step(function(){
//
//                    // 查标签
//                    helper.db.coll("welab/customers").aggregate([
//                        {$match:{tags:seed.tag}},
//                        {$group: {
//                            _id: "$wechatid"
//                        }}
//                    ],this.hold(function(err,doc){
//
//                        res = {err: 0, msg:doc.length};
//                    }))
//
//                })
                this.step(function(){

                    nut.disable();
                    var data = JSON.stringify(res);
                    this.res.writeHead(200, { 'Content-Type': 'application/json' });
                    this.res.write(data);
                    this.res.end();
                })
            }
        }

        , send: {

            process: function (seed, nut) {

                var res = {}
                var list = {}
                var reply = {}
                var updateReply = {
                    "articles": [

                    ]
                }
                var then = this
                nut.view.disable();

                if(process.wxApi == null){
                    res = {err:1,msg:"不是认证服务号，不能使用群发功能"}
                }

                this.step(function(){

                    // 查标签
                    helper.db.coll("welab/customers").aggregate([
                        {$match:{tags:seed.tag}},
                        {$group: {
                            _id: "$wechatid"
                        }}
                    ],this.hold(function(err,doc){
                        list = doc
                    }))

                    // 查回复
                    helper.db.coll("welab/reply").findOne({_id:helper.db.id(seed.reply)},this.hold(function(err,docs){
                        if(err) throw err ;
                        reply = docs
                    }))


                })
                this.step(function(){

                    if(list.length == 0){
                        res = {err: 1, msg:"查不到这个标签"};
                        return;
                    }else if(!reply){
                        res = {err: 1, msg:"查不到这个回复"};
                        return;
                    }else{

                    }
                })

                // 上传附件
                this.step(function(){


                    if(res.err != 1){

                        var path = require("path")
                        var fs = require("fs")
                        if(reply.type == "list"){

                            if(fs.existsSync(path.join(__dirname,"../../../../../") + reply.pic)){
                                process.wxApi.uploadMedia(path.join(__dirname,"../../../../../") + reply.pic, 'image', then.hold(function(err,doc){
                                    if(err)console.log(err)

                                    updateReply.articles.push({
                                        "thumb_media_id":doc.media_id,
                                        "title":reply.title,
                                        "content_source_url":reply.link,
                                        "content":reply.content,
                                        "digest":reply.tabloid,
                                        "show_cover_pic":"1"
                                    })
                                }));
                            }else{
                                res = {err:1,msg:"上传文件失败，图片不存在。"}
                                return;
                            }

                            for(var i=0 ; i< reply.items.length ; i ++){
                                (function(i){

                                    if(fs.existsSync(path.join(__dirname,"../../../../../") + reply.items[i].pic)){
                                        process.wxApi.uploadMedia(path.join(__dirname,"../../../../../") + reply.items[i].pic, 'image', then.hold(function(err,doc){
                                            if(err)console.log(err)

                                            updateReply.articles.push({
                                                "thumb_media_id":doc.media_id,
                                                "title":reply.title,
                                                "content_source_url":reply.link,
                                                "content":reply.content,
                                                "digest":reply.tabloid,
                                                "show_cover_pic":"1"
                                            })
                                        }));
                                    }else{
                                        res = {err:1,msg:"上传文件失败，图片不存在。"}
                                        return;
                                    }
                                })(i)
                            }
                        }else if(reply.type == "single"){

                            if(fs.existsSync(path.join(__dirname,"../../../../../") + reply.pic)){
                                process.wxApi.uploadMedia(path.join(__dirname,"../../../../../") + reply.pic, 'image', then.hold(function(err,doc){
                                    if(err)console.log(err)

                                    updateReply.articles.push({
                                        "thumb_media_id":doc.media_id,
                                        "title":reply.title,
                                        "content_source_url":reply.link,
                                        "content":reply.content,
                                        "digest":reply.tabloid,
                                        "show_cover_pic":"1"
                                    })
                                }));
                            }else{
                                res = {err:1,msg:"上传文件失败，图片不存在。"}
                                return;
                            }
                        }
                    }
                })

                // 上传回复
                this.step(function(){

                    if((reply.type == "list" || reply.type == "single") && res.err != 1){

                        process.wxApi.uploadNews(updateReply, then.hold(function(err,doc){
                            if(err)console.log(err)
                            return doc.media_id;
                        }));
                    }
                })

                // 群发
                this.step(function(media_id){

                    if(res.err != 1){

                        // all user
                        var userlist = []
                        for(var i=0;i<list.length;i++){
                            userlist.push(list[i]._id)
                        }

                        if(reply.type == "list" || reply.type == "single"){
                            process.wxApi.massSendNews(media_id,userlist,then.hold(function(err,doc){
                                if(err){
                                    console.log(err)
                                    res = {err:1,msg:err.message}
                                }else{
                                    log(doc.msg_id,updateReply,userlist,doc)
                                    res = {err:0,msg:doc.errcode==0?"发送完成":doc.errmsg}
                                }
                            }))
                        }else if(reply.type == "text"){
                            process.wxApi.massSendText(reply.content,userlist, then.hold(function(err,doc){
                                if(err){
                                    console.log(err)
                                    res = {err:1,msg:err.message}
                                }else{
                                    log(doc.msg_id,reply.content,userlist,doc)
                                    res = {err:0,msg:doc.errcode==0?"发送完成":doc.errmsg}
                                }
                            }));
                        }
                    }
                    return media_id;
                })


                this.step(function(){

                    nut.disable();
                    var data = JSON.stringify(res);
                    this.res.writeHead(200, { 'Content-Type': 'application/json' });
                    this.res.write(data);
                    this.res.end();
                })

            }
        }
    }
}


function log(msgid,content,userlist,sendres){

    helper.db.coll("welab/masslog").insert({msgid:msgid,content:content,userlist:userlist,sendres:sendres,createTime:new Date().getTime()},function(err,docs) {
        if (err) throw err;
    })
}