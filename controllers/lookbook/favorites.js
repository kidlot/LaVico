module.exports = {

    layout: "welab/Layout"
    , view: "lavico/templates/lookbook/favorites.html"

    , process: function(seed,nut)
    {
    }
    , actions: {

        save:{
            process: function(seed,nut)
            {
                nut.disable();

                try{

                    this.step(function(){

                        if(seed.wxid && seed.pid){
                            helper.db.coll("lavico/favorites").findOne({productId:seed.pid},this.hold(function(err,_doc){

                                if(err) console.log(err)

                                if(_doc){

                                    var data = JSON.stringify({err:1,msg:"已经收藏过此产品"});
                                    this.res.writeHead(200, { 'Content-Type': 'application/json' });
                                    this.res.write(data);
                                    this.res.end();
                                    this.terminate()
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


                            helper.db.coll("lavico/favorites").insert({lookbookid:doc._id,pageid:oPage._id,productId:oProduct._id,wxid:seed.wxid,createDate:new Date().getTime()},this.hold(function(err,_doc){

                                if(err) console.log(err)
                            }))

                            _log(seed.wxid,"收藏",{lookbookid:doc._id,pageid:oPage._id,productId:oProduct._id,wxid:seed.wxid,createDate:new Date().getTime()})

                            var lookbook = {
                                "_id": doc._id,
                                "pageId": oPage._id,
                                "productId": oProduct._id,
                                "createDate": new Date().getTime(),
                                "name": oProduct.name
                            }

                            helper.db.coll("welab/customers").update({wechatid : seed.wxid}, {$addToSet:{lookbook:lookbook}},this.hold(function(err,doc){
                                if(err ){
                                    throw err;
                                }
                            })) ;

                        }))


                        var data = JSON.stringify({err:0});
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





function _log(wxid,action,data){
    helper.db.coll("lavico/user/logs").insert({createTime:new Date().getTime(),wxid:wxid,action:action,data:data}, function(err, doc){
        if(err)console.log(err)
    })
}


