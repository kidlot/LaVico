module.exports = {

    layout: "lavico/layout"
    , view: "lavico/templates/lookbook/favorites.html"

    , process: function(seed,nut)
    {
        if(seed.wxid){

            var docs = [];


            nut.model.memberID = false;
            nut.model.fromWelab = seed.fromWelab || ""

            helper.db.coll("welab/customers").findOne({wechatid:seed.wxid},this.hold(function(err,customers){
                var customers = customers || {}

                if(customers.HaiLanMemberInfo && customers.HaiLanMemberInfo.memberID && customers.HaiLanMemberInfo.action == "bind"){
                    nut.model.memberID = customers.HaiLanMemberInfo.memberID
                }
            }))

            this.step(function(){

                helper.db.coll("lavico/favorites").find({memberID:nut.model.memberID}).toArray(this.hold(function(err,_doc){

                    if(err) console.log(err);
                    var then = this;
                    docs = _doc
                    if(_doc){
                        for(var i=0 ; i<_doc.length ; i++){

                            (function(i){

                                helper.db.coll("lavico/lookbook").findOne({_id:_doc[i].lookbookid},then.hold(function(err,_docLookBook){

                                    if(err) console.log(err)

                                    if(_docLookBook){

                                        for(var ii=0 ; ii < _docLookBook.page.length ; ii++){
                                            if(_docLookBook.page[ii]._id == _doc[i].pageid){
                                                for(var iii=0 ; iii < _docLookBook.page[ii].product.length ; iii++){
                                                    if(_docLookBook.page[ii].product[iii]._id == _doc[i].productId){
                                                        _doc[i].pageNum = ii+1
                                                        _doc[i].product = _docLookBook.page[ii].product[iii]
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }))
                            })(i)
                        }
                    }
                }))
            })


            this.step(function(){

                console.log(docs)
                nut.model.wxid = seed.wxid
                nut.model.docs = docs||[]
            })

        }else{
            var data = JSON.stringify({err:1,msg:"没有微信ID"});
            this.res.writeHead(200, { 'Content-Type': 'application/json' });
            this.res.write(data);
            this.res.end();
        }
    }
    , actions: {

        cancelFav:{
            process: function(seed,nut)
            {
                nut.disable();

                try{

                    this.step(function(){

                        if(seed._id){
                            helper.db.coll("lavico/favorites").remove({_id:helper.db.id(seed._id)},this.hold(function(err,_doc){

                                if(err) console.log(err)

                                if(_doc){

                                    var data = JSON.stringify({err:0});
                                    this.res.writeHead(200, { 'Content-Type': 'application/json' });
                                    this.res.write(data);
                                    this.res.end();
                                }
                            }))

                        }else{
                            var data = JSON.stringify({err:1,msg:"参数不正确"});
                            this.res.writeHead(200, { 'Content-Type': 'application/json' });
                            this.res.write(data);
                            this.res.end();
                        }
                    })

                }catch(e){
                    if (e) console.log(e)
                }

            }
        }
        , save:{
            process: function(seed,nut)
            {
                nut.disable();
                var memberid = false;

                try{

                    // wxid => memberid
                    this.step(function(){

                        helper.db.coll('welab/customers').findOne({wechatid:seed.wxid},this.hold(function(err,doc) {

                            memberid = doc.HaiLanMemberInfo ? doc.HaiLanMemberInfo.memberID : "";

                        }))

                    })
                    this.step(function(){

                        if(memberid && seed.pid){
                            helper.db.coll("lavico/favorites").findOne({productId:seed.pid,memberID:memberid},this.hold(function(err,_doc){

                                if(err) console.log(err)

                                if(_doc){

                                    var data = JSON.stringify({err:1,msg:"已经收藏过此产品"});
                                    this.res.writeHead(200, { 'Content-Type': 'application/json' });
                                    this.res.write(data);
                                    this.res.end();
                                    this.terminate();
                                }
                            }))

                        }else{
                            var data = JSON.stringify({err:1,msg:"没有微信ID或产品ID"});
                            this.res.writeHead(200, { 'Content-Type': 'application/json' });
                            this.res.write(data);
                            this.res.end();
                        }
                    })
                    this.step(function(){

                        helper.db.coll("lavico/lookbook").findOne({"page.product._id":seed.pid},this.hold(function(err,_doc){
                            doc = _doc || {}

                            console.log(doc)
                            var oProduct,oPage

                            for(var i=0 ; i<doc.page.length ; i++){
                                for(var ii=0 ; ii<doc.page[i].product.length ; ii++){

                                    if(doc.page[i].product[ii]._id == seed.pid){
                                        oProduct = doc.page[i].product[ii]
                                        oPage = doc.page[i]
                                    }
                                }
                            }


                            helper.db.coll("lavico/favorites").insert({lookbookid:doc._id,pageid:oPage._id,productId:oProduct._id,wxid:seed.wxid,memberID:parseInt(seed.memberID),createDate:new Date().getTime()},this.hold(function(err,_doc){

                                if(err) console.log(err)
                            }))

                            _log(seed.wxid,seed.memberID,"收藏",{lookbookid:doc._id,pageid:oPage._id,productId:oProduct._id,wxid:seed.wxid,createDate:new Date().getTime()})

                            var lookbook = {
                                "_id": doc._id.toString(),
                                "pageId": oPage._id,
                                "productID": oProduct._id,
                                "createDate": new Date().getTime(),
                                "name": oProduct.name
                            }

                            helper.db.coll("welab/customers").update({wechatid : seed.wxid}, {$addToSet:{lookbook:lookbook}},this.hold(function(err,doc){
                                if(err ){
                                    throw err;
                                }
                            })) ;

                        }))


                        var data = JSON.stringify({err:0,msg:"收藏成功"});
                        this.res.writeHead(200, { 'Content-Type': 'application/json' });
                        this.res.write(data);
                        this.res.end();

                    })

                }catch(e){
                    if (e) console.log(e)
                }

            }
        }
    }
}





function _log(wxid,memberID,action,data){
    helper.db.coll("lavico/user/logs").insert({createTime:new Date().getTime(),wxid:wxid,memberID:parseInt(memberID),action:action,data:data}, function(err, doc){
        if(err)console.log(err)
    })
}


