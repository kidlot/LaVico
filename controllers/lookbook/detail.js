module.exports = {

	layout: "lavico/layout"
	, view: "lavico/templates/lookbook/detail.html"

    , process: function(seed,nut){
        var wxid=seed.wxid || undefined;

        var doc = {};

        this.res.setHeader("Cache-Control", "no-cache");
        this.res.setHeader("Cache-Control", "no-store");
        this.res.setHeader("Pragma","no-cache");


        this.step(function(){
            if(wxid == undefined){
                if(this.req.session.oauthTokenInfo){
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
                                    var openid = doc.openid
                                    wxid = openid || undefined;
                                    console.log("通过oauth获得信息",doc)
                                    this.req.session.oauthTokenInfo = doc;
                                }
                            }))
                        }
                    }
                }
            }
        })

        this.step(function(){
            //console.log("wechatid:"+wxid)
            if(wxid != undefined){
                helper.db.coll('welab/customers').findOne({wechatid:wxid},this.hold(function(err, doc){
                    var doc = doc || {};
                    //console.log("doc:"+doc.isFollow)
                    nut.model.isFollow = doc.isFollow ? true : false;
                }));
            }else{
                nut.model.isFollow = false;
            }
        })

        this.step(function(){
            helper.db.coll("welab/customers").findOne({"wechatid":wxid},this.hold(function(err,doc){
                if(err) throw err;
                //console.log("welab/customers")
                //console.log(doc)
                if(doc && doc.HaiLanMemberInfo){
                    if(doc.HaiLanMemberInfo.action=='bind') {
                        memberid = doc.HaiLanMemberInfo.memberID;
                        nut.model.flag = "0";
                    }else{
                        memberid = doc.HaiLanMemberInfo.memberID;
                        nut.model.flag="1";
                    }
                }else{
                    //未绑定
                    memberid = "undefined";
                    nut.model.flag="1";
                }
                nut.model.memberid = memberid;
            }))
        })

        this.step(function(){
            nut.model.wxid = wxid
        })

        this.step(function(){
            //console.log("wxid:"+seed.wxid)
            //console.log("_id:"+seed._id);
            if(seed._id){
                nut.model._id = seed._id
                nut.model.pageNum = parseInt(seed.pageNum) || 1
                nut.model.fromWelab = seed.fromWelab || ""

                helper.db.coll("lavico/lookbook").findOne({_id:helper.db.id(seed._id)},this.hold(function(err,_doc){
                    doc = _doc || {}
                    nut.model.allPage = doc
                    console.log(doc)
                    nut.model.doc = doc.page[nut.model.pageNum-1]
                    nut.model.lookbookType = doc.type
                    nut.model.sumPageNum = doc.page.length
                    //console.log(nut.model.allPage)
                }))
            }else{
                //console.log("wxid:"+seed.wxid)
                //console.log("_id:"+seed._id);
                nut.disable();
                var data = JSON.stringify({err:1,msg:"没有微信ID或产品ID"});
                this.res.writeHead(200, { 'Content-Type': 'application/json' });
                this.res.write(data);
                this.res.end();
            }
        })
    },
    viewIn:function(){
        var active = 0,
            as = document.getElementById('indicator_03_01').getElementsByTagName('li');
        for (var i = 0; i < as.length; i++) {
            (function () {
                var j = i;
                as[i].onclick = function () {
                    t2.slide(j);
                    return false;
                }
            })();
        }
        var t2 = new TouchSlider({
            id: 'slider', speed: 600, timeout: 6000, before: function (index) {
                as[active].className = '';
                active = index;
                as[active].className = 'active';
            }
        });
    }

}







