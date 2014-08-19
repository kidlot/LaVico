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

                var conditions = {} ;

                this.step(function() {
                    conditions = search.conditions(seed.params) ;
                    //console.log(conditions);

                    //关注时间 任意
                    if (conditions && conditions.$or && conditions.$or[0] && conditions.$or[0].followTime) {
                        conditions.$or[0].followTime.$gt = parseInt(conditions.$or[0].followTime.$gt / 1000);
                        conditions.$or[0].followTime.$lt = parseInt(conditions.$or[0].followTime.$lt / 1000);

                    }

                    //关注时间 全部
                    if (conditions && conditions.$and && conditions.$and[0] && conditions.$and[0].followTime) {
                        conditions.$and[0].followTime.$gt = parseInt(conditions.$and[0].followTime.$gt / 1000);
                        conditions.$and[0].followTime.$lt = parseInt(conditions.$and[0].followTime.$lt / 1000);
                    }
                    //年龄 任意
                    if (conditions && conditions.$or && conditions.$or[0] && conditions.$or[0].birthday) {
                        if (conditions.$or[0].birthday.$gt) {
                            conditions.$or[0].birthday.$gt = new Date((parseInt(new Date().getFullYear() - parseInt(conditions.$or[0].birthday.$gt))) + "-12-31 23:59:59").getTime();
                        } else if (conditions.$or[0].birthday.$lt) {
                            conditions.$or[0].birthday.$lt = new Date((parseInt(new Date().getFullYear() - parseInt(conditions.$or[0].birthday.$lt))) + "-01-01 00:00:00").getTime();
                        } else if (conditions.$or[0].birthday.$lte) {
                            conditions.$or[0].birthday.$lte = new Date((parseInt(new Date().getFullYear() - parseInt(conditions.$or[0].birthday.$lte))) + "-12-31 23:59:59").getTime();
                        } else if (conditions.$or[0].birthday.$gte) {
                            conditions.$or[0].birthday.$gte = new Date((parseInt(new Date().getFullYear() - parseInt(conditions.$or[0].birthday.$gte))) + "-01-01 00:00:00").getTime();
                        } else {
                            var gt = new Date((parseInt(new Date().getFullYear() - parseInt(conditions.$or[0].birthday))) + "-01-01 00:00:00").getTime();
                            var lt = new Date((parseInt(new Date().getFullYear() - parseInt(conditions.$or[0].birthday))) + "-12-31 23:59:59").getTime();
                            var investigation = {$gte: gt, $lte: lt};
                            conditions.$or[0].birthday = investigation;
                        }
                    }
                    //年龄 全部
                    if (conditions && conditions.$and && conditions.$and[0] && conditions.$and[0].birthday) {
                        if (conditions.$and[0].birthday.$gt) {
                            conditions.$and[0].birthday.$gt = new Date((parseInt(new Date().getFullYear() - parseInt(conditions.$and[0].birthday.$gt))) + "-12-31 23:59:59").getTime();
                        } else if (conditions.$and[0].birthday.$lt) {
                            conditions.$and[0].birthday.$lt = new Date((parseInt(new Date().getFullYear() - parseInt(conditions.$and[0].birthday.$lt))) + "-01-01 00:00:00").getTime();
                        } else if (conditions.$and[0].birthday.$lte) {
                            conditions.$and[0].birthday.$lte = new Date((parseInt(new Date().getFullYear() - parseInt(conditions.$and[0].birthday.$lte))) + "-12-31 23:59:59").getTime();
                        } else if (conditions.$and[0].birthday.$gte) {
                            conditions.$and[0].birthday.$gte = new Date((parseInt(new Date().getFullYear() - parseInt(conditions.$and[0].birthday.$gte))) + "-01-01 00:00:00").getTime();
                        } else {
                            var gt = new Date((parseInt(new Date().getFullYear() - parseInt(conditions.$and[0].birthday))) + "-01-01 00:00:00").getTime();
                            var lt = new Date((parseInt(new Date().getFullYear() - parseInt(conditions.$and[0].birthday))) + "-12-31 23:59:59").getTime();
                            var investigation = {$gte: gt, $lte: lt};
                            conditions.$and[0].birthday = investigation;
                        }
                    }
                });


                this.step(function(){
                    //console.log(conditions);
                    helper.db.coll("welab/customers").find(conditions).toArray(this.hold(function(err,doc){
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
        , man:{
            process:function(seed,nut){
                //综合查询
                var res = {}
                nut.view.disable();
                console.log('******************');
                console.log(seed.params);
                console.log('******************');

                var conditions = {} ;

                this.step(function() {
                    conditions = search.conditions(seed.params) ;
                    console.log(conditions);

                    //关注时间 任意
                    if (conditions && conditions.$or && conditions.$or[0] && conditions.$or[0].followTime) {
                        conditions.$or[0].followTime.$gt = parseInt(conditions.$or[0].followTime.$gt / 1000);
                        conditions.$or[0].followTime.$lt = parseInt(conditions.$or[0].followTime.$lt / 1000);

                    }

                    //关注时间 全部
                    if (conditions && conditions.$and && conditions.$and[0] && conditions.$and[0].followTime) {
                        conditions.$and[0].followTime.$gt = parseInt(conditions.$and[0].followTime.$gt / 1000);
                        conditions.$and[0].followTime.$lt = parseInt(conditions.$and[0].followTime.$lt / 1000);
                    }
                    //年龄 任意
                    if (conditions && conditions.$or && conditions.$or[0] && conditions.$or[0].birthday) {
                        if (conditions.$or[0].birthday.$gt) {
                            conditions.$or[0].birthday.$gt = new Date((parseInt(new Date().getFullYear() - parseInt(conditions.$or[0].birthday.$gt))) + "-12-31 23:59:59").getTime();
                        } else if (conditions.$or[0].birthday.$lt) {
                            conditions.$or[0].birthday.$lt = new Date((parseInt(new Date().getFullYear() - parseInt(conditions.$or[0].birthday.$lt))) + "-01-01 00:00:00").getTime();
                        } else if (conditions.$or[0].birthday.$lte) {
                            conditions.$or[0].birthday.$lte = new Date((parseInt(new Date().getFullYear() - parseInt(conditions.$or[0].birthday.$lte))) + "-12-31 23:59:59").getTime();
                        } else if (conditions.$or[0].birthday.$gte) {
                            conditions.$or[0].birthday.$gte = new Date((parseInt(new Date().getFullYear() - parseInt(conditions.$or[0].birthday.$gte))) + "-01-01 00:00:00").getTime();
                        } else {
                            var gt = new Date((parseInt(new Date().getFullYear() - parseInt(conditions.$or[0].birthday))) + "-01-01 00:00:00").getTime();
                            var lt = new Date((parseInt(new Date().getFullYear() - parseInt(conditions.$or[0].birthday))) + "-12-31 23:59:59").getTime();
                            var investigation = {$gte: gt, $lte: lt};
                            conditions.$or[0].birthday = investigation;
                        }
                    }
                    //年龄 全部
                    if (conditions && conditions.$and && conditions.$and[0] && conditions.$and[0].birthday) {
                        if (conditions.$and[0].birthday.$gt) {
                            conditions.$and[0].birthday.$gt = new Date((parseInt(new Date().getFullYear() - parseInt(conditions.$and[0].birthday.$gt))) + "-12-31 23:59:59").getTime();
                        } else if (conditions.$and[0].birthday.$lt) {
                            conditions.$and[0].birthday.$lt = new Date((parseInt(new Date().getFullYear() - parseInt(conditions.$and[0].birthday.$lt))) + "-01-01 00:00:00").getTime();
                        } else if (conditions.$and[0].birthday.$lte) {
                            conditions.$and[0].birthday.$lte = new Date((parseInt(new Date().getFullYear() - parseInt(conditions.$and[0].birthday.$lte))) + "-12-31 23:59:59").getTime();
                        } else if (conditions.$and[0].birthday.$gte) {
                            conditions.$and[0].birthday.$gte = new Date((parseInt(new Date().getFullYear() - parseInt(conditions.$and[0].birthday.$gte))) + "-01-01 00:00:00").getTime();
                        } else {
                            var gt = new Date((parseInt(new Date().getFullYear() - parseInt(conditions.$and[0].birthday))) + "-01-01 00:00:00").getTime();
                            var lt = new Date((parseInt(new Date().getFullYear() - parseInt(conditions.$and[0].birthday))) + "-12-31 23:59:59").getTime();
                            var investigation = {$gte: gt, $lte: lt};
                            conditions.$and[0].birthday = investigation;
                        }
                    }
                });


                this.step(function(){
                    console.log(conditions);
                    helper.db.coll("welab/customers").find(conditions).toArray(this.hold(function(err,doc){
                        if(doc){
                            res = {err: 0, msg:doc.length};
                        }else{
                            console.log(0);
                            res = {err: 0, msg:0};
                        }
                    }));
                });

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

                console.log('******************');
                console.log(seed.params);
                seed.reply = seed.params[2].value;
                console.log(seed.reply);
                console.log('******************');

                var res = {}
                var list = []
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


                var conditions = {} ;

                this.step(function() {
                    conditions = search.conditions(seed.params) ;
                    console.log(conditions);

                    //关注时间 任意
                    if (conditions && conditions.$or && conditions.$or[0] && conditions.$or[0].followTime) {
                        conditions.$or[0].followTime.$gt = parseInt(conditions.$or[0].followTime.$gt / 1000);
                        conditions.$or[0].followTime.$lt = parseInt(conditions.$or[0].followTime.$lt / 1000);

                    }

                    //关注时间 全部
                    if (conditions && conditions.$and && conditions.$and[0] && conditions.$and[0].followTime) {
                        conditions.$and[0].followTime.$gt = parseInt(conditions.$and[0].followTime.$gt / 1000);
                        conditions.$and[0].followTime.$lt = parseInt(conditions.$and[0].followTime.$lt / 1000);
                    }
                    //年龄 任意
                    if (conditions && conditions.$or && conditions.$or[0] && conditions.$or[0].birthday) {
                        if (conditions.$or[0].birthday.$gt) {
                            conditions.$or[0].birthday.$gt = new Date((parseInt(new Date().getFullYear() - parseInt(conditions.$or[0].birthday.$gt))) + "-12-31 23:59:59").getTime();
                        } else if (conditions.$or[0].birthday.$lt) {
                            conditions.$or[0].birthday.$lt = new Date((parseInt(new Date().getFullYear() - parseInt(conditions.$or[0].birthday.$lt))) + "-01-01 00:00:00").getTime();
                        } else if (conditions.$or[0].birthday.$lte) {
                            conditions.$or[0].birthday.$lte = new Date((parseInt(new Date().getFullYear() - parseInt(conditions.$or[0].birthday.$lte))) + "-12-31 23:59:59").getTime();
                        } else if (conditions.$or[0].birthday.$gte) {
                            conditions.$or[0].birthday.$gte = new Date((parseInt(new Date().getFullYear() - parseInt(conditions.$or[0].birthday.$gte))) + "-01-01 00:00:00").getTime();
                        } else {
                            var gt = new Date((parseInt(new Date().getFullYear() - parseInt(conditions.$or[0].birthday))) + "-01-01 00:00:00").getTime();
                            var lt = new Date((parseInt(new Date().getFullYear() - parseInt(conditions.$or[0].birthday))) + "-12-31 23:59:59").getTime();
                            var investigation = {$gte: gt, $lte: lt};
                            conditions.$or[0].birthday = investigation;
                        }
                    }
                    //年龄 全部
                    if (conditions && conditions.$and && conditions.$and[0] && conditions.$and[0].birthday) {
                        if (conditions.$and[0].birthday.$gt) {
                            conditions.$and[0].birthday.$gt = new Date((parseInt(new Date().getFullYear() - parseInt(conditions.$and[0].birthday.$gt))) + "-12-31 23:59:59").getTime();
                        } else if (conditions.$and[0].birthday.$lt) {
                            conditions.$and[0].birthday.$lt = new Date((parseInt(new Date().getFullYear() - parseInt(conditions.$and[0].birthday.$lt))) + "-01-01 00:00:00").getTime();
                        } else if (conditions.$and[0].birthday.$lte) {
                            conditions.$and[0].birthday.$lte = new Date((parseInt(new Date().getFullYear() - parseInt(conditions.$and[0].birthday.$lte))) + "-12-31 23:59:59").getTime();
                        } else if (conditions.$and[0].birthday.$gte) {
                            conditions.$and[0].birthday.$gte = new Date((parseInt(new Date().getFullYear() - parseInt(conditions.$and[0].birthday.$gte))) + "-01-01 00:00:00").getTime();
                        } else {
                            var gt = new Date((parseInt(new Date().getFullYear() - parseInt(conditions.$and[0].birthday))) + "-01-01 00:00:00").getTime();
                            var lt = new Date((parseInt(new Date().getFullYear() - parseInt(conditions.$and[0].birthday))) + "-12-31 23:59:59").getTime();
                            var investigation = {$gte: gt, $lte: lt};
                            conditions.$and[0].birthday = investigation;
                        }
                    }
                });


                this.step(function(){
                    console.log(conditions);

                    helper.db.coll("welab/customers").find(conditions).toArray(this.hold(function(err,doc){
                        if(doc){
                            var _user ={};
                            for(var _i=0;_i<doc.length;_i++){
                                _user = {_id:doc[_i].wechatid};
                                console.log(_user);
                                if(!list.in_array(_user)){
                                    list.push(_user);
                                }
                            }
                        }else{
                            list = [];
                        }
                        console.log('********************send_users****************');
                        console.log(list);
                        console.log('********************send_users****************');

                    }));
                    //查回复
                    helper.db.coll("welab/reply").findOne({_id:helper.db.id(seed.reply)},this.hold(function(err,docs){
                        if(err) throw err ;
                        reply = docs
                    }))
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
//                        list = doc
//                    }))
//
//                    // 查回复
//                    helper.db.coll("welab/reply").findOne({_id:helper.db.id(seed.reply)},this.hold(function(err,docs){
//                        if(err) throw err ;
//                        reply = docs
//                    }))
//
//
//                })
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
                        console.log(path.join(__dirname,"../../../../../../"));
                        console.log(reply.pic);
                        //console.log(__dirname);
                        console.log(path.join(__dirname,"../../../../../../") + reply.pic);
                        if(reply.type == "list"){

                            if(fs.existsSync(path.join(__dirname,"../../../../../../") + reply.pic)){
                                process.wxApi.uploadMedia(path.join(__dirname,"../../../../../../") + reply.pic, 'image', then.hold(function(err,doc){
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

                                    if(fs.existsSync(path.join(__dirname,"../../../../../../") + reply.items[i].pic)){
                                        process.wxApi.uploadMedia(path.join(__dirname,"../../../../../../") + reply.items[i].pic, 'image', then.hold(function(err,doc){
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

                            if(fs.existsSync(path.join(__dirname,"../../../../../../") + reply.pic)){

                                process.wxApi.uploadMedia(path.join(__dirname,"../../../../../../") + reply.pic, 'image', then.hold(function(err,doc){                               console.log('single-come-on');

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
                        console.log('******************************');
                        console.log(userlist);
                        console.log('******************************');

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
Array.prototype.in_array = function (e) {
    for (i = 0; i < this.length && this[i] != e; i++);
    return !(i == this.length);
}
