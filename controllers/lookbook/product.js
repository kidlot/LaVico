module.exports = {

	layout: "lavico/layout"
	, view: "lavico/templates/lookbook/product.html"

    , process: function(seed,nut)
    {
        var wxid=seed.wxid || undefined;
        var doc = [];

        this.res.setHeader("Cache-Control", "no-cache");
        this.res.setHeader("Cache-Control", "no-store");
        this.res.setHeader("Pragma","no-cache");

        this.step(function(){
            if(wxid == undefined || wxid == '{wxid}'){
                if(this.req.session.oauthTokenInfo && this.req.session.oauthTokenInfo.openid){
                    console.log("从SESSION中读取OPENID",this.req.session.oauthTokenInfo.openid)
                    wxid = this.req.session.oauthTokenInfo.openid
                }else{
                    // 通过oauth获取OPENID
                    if(process.wxOauth){
                        if(!seed.code){
                            var url = process.wxOauth.getAuthorizeURL("http://"+this.req.headers.host+this.req.url,"123","snsapi_base")
                            console.log("通过oauth获得CODE的url",url)
                            this.res.writeHeader(302, {'location': url }) ;
                            nut.disable();//不显示模版
                            this.res.end();
                            this.terminate();
                        }else{
                            process.wxOauth.getAccessToken(seed.code,this.hold(function(err,doc){
                                if(!err){
                                    var openid = doc.data.openid
                                    wxid = openid || undefined;
                                    console.log("通过oauth获得信息",doc)
                                    this.req.session.oauthTokenInfo = doc.data;
                                }
                            }))
                        }
                    }
                }
            }
        })

        this.step(function(){
            console.log("wechatid:"+wxid)
            if(wxid != undefined){
                helper.db.coll('welab/customers').findOne({"wechatid":wxid},this.hold(function(err, doc){
                    var doc = doc || {};
                    console.log("doc:"+doc.isFollow)
                    nut.model.isFollow = doc.isFollow ? true : false;
                }));
            }else{
                nut.model.isFollow = false;
            }
        })

        this.step(function(){
            nut.model.wxid = wxid
        })

        this.step(function(){
            if(seed._id){

                //nut.model.wxid = seed.wxid
                nut.model._id = seed._id
                nut.model.productId = seed.productId
                nut.model.source = seed.source||""
                nut.model.memberID = false
                nut.model.fromWelab = seed.fromWelab || undefined
                nut.model.pageNum = seed.pageNum || 1

                helper.db.coll("welab/customers").findOne({"wechatid":seed.wxid},this.hold(function(err,customers){
                    var customers = customers || {}

                    nut.model.isVip = false
                    if(customers && customers.HaiLanMemberInfo){
                        if(customers.HaiLanMemberInfo.action=="bind"){
                            nut.model.isVip = true;
                            nut.model.memberID = customers.HaiLanMemberInfo.memberID
                        }else{
                            nut.model.isVip = false;
                            nut.model.memberID = customers.HaiLanMemberInfo.memberID
                        }
                    }else{
                        nut.model.memberID= "undefined";
                        nut.model.isVip = false;
                    }
//                    if(customers.HaiLanMemberInfo && customers.HaiLanMemberInfo.memberID && customers.HaiLanMemberInfo.action == "bind"){
//                        nut.model.isVip = true
//                        nut.model.memberID = customers.HaiLanMemberInfo.memberID
//
//                    }
                }))


                helper.db.coll("lavico/lookbook").findOne({_id:helper.db.id(seed._id)},this.hold(function(err,_doc){

                    nut.model.pageName = _doc.name
                    var aPageList = _doc.page[nut.model.pageNum-1]

                    if(aPageList.product){
                        if(seed.onlyProduct == "true"){

                            for(var i=0 ; i < aPageList.product.length ; i++){

                                if(seed.productId == aPageList.product[i]._id && aPageList.product[i].bigPic){

                                    for(var ii=0 ; ii < aPageList.product[i].bigPic.length ; ii++){

                                        aPageList.product[i].bigPic[ii].detail = aPageList.product[i].detail
                                        aPageList.product[i].bigPic[ii].name = aPageList.product[i].name
                                        aPageList.product[i].bigPic[ii]._id = aPageList.product[i]._id
                                        doc.push(aPageList.product[i].bigPic[ii])
                                    }
                                }
                            }
                        }else{
                            for(var i=0 ; i < aPageList.product.length ; i++){

                                if(aPageList.product[i].bigPic){

                                    for(var ii=0 ; ii < aPageList.product[i].bigPic.length ; ii++){

                                        aPageList.product[i].bigPic[ii].detail = aPageList.product[i].detail
                                        aPageList.product[i].bigPic[ii].name = aPageList.product[i].name
                                        aPageList.product[i].bigPic[ii]._id = aPageList.product[i]._id
                                        doc.push(aPageList.product[i].bigPic[ii])
                                    }
                                }
                            }
                        }
                    }

                }))

                this.step(function(){

                    nut.model.jsonDoc = JSON.stringify(doc)
                    nut.model.doc = doc
                    console.log("11",doc)
                })
            }else{
                nut.disable();
                var data = JSON.stringify({err:1,msg:"没有微信ID或产品ID"});
                this.res.writeHead(200, { 'Content-Type': 'application/json' });
                this.res.write(data);
                this.res.end();
            }
        })


    }
}







