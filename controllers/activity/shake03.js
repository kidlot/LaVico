/*
* 摇一摇活动介绍页面
* 类型：03
* 先游戏后不提示注册（后置）
* 活动规则：不需要注册，就可以玩游戏。
* URL：{host}/lavico/shake
* */

var middleware = require('../../lib/middleware.js');
module.exports = {
    layout: "lavico/layout",
    view: "lavico/templates/activity/shake03.html",
    process:function(seed,nut){

        var wxid = seed.uid ? seed.uid : 'undefined';//uid是用户的wechatid
        var aid = seed.aid ? seed.aid : 'undefined';//摇一摇活动ID
        var error;
        nut.model.fromWelab = seed.fromWelab || ""

        var member_id;
        var shake;

        this.step(function(){
            //oauth认证
            if(wxid == 'undefined' || wxid == '{wxid}'){

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
                                    wxid = openid || "undefined";
                                    console.log("通过oauth获得信息",doc)
                                    this.req.session.oauthTokenInfo = doc.data;
                                }
                            }))
                        }

                    }
                }
            }
        });

        this.step(function(){
            if(wxid == 'undefined' || wxid == '{wxid}'){
                nut.disable();//不显示模版
                this.res.writeHead(200, { 'Content-Type': 'application/json' });
                this.res.write('{"error":"wxid_is_empty"}');
                this.res.end();
                this.terminate();
            }
        });

        this.step(function(){

            if(wxid == 'undefined'){
                //缺少微信ID参数，强制中断
                nut.disable();//不显示模版
                this.res.writeHead(200, { 'Content-Type': 'application/json' });
                this.res.write('{"error":"wxid_is_empty"}');
                this.res.end();
                this.terminate();

            }else{

                helper.db.coll('welab/customers').findOne({wechatid:wxid},this.hold(function(err, doc){

                    var doc = doc || {};
                    nut.model.isVip = false;

                    if(doc){
                        nut.model.isFollow = doc.isFollow ? true : false;
                    }else{
                        nut.model.isFollow = false;
                    }

                    if(doc&&doc.shake){
                        nut.model.shake = "true";
                    }else{
                        nut.model.shake = "false";
                    }

                    if(doc && doc.HaiLanMemberInfo && doc.HaiLanMemberInfo.memberID && doc.HaiLanMemberInfo.action=='bind' ){
                        nut.model.member_id = "normal";
                    }else{
                        nut.model.member_id = "undefined";
                    }

                    nut.model.check_coupon_url = '/lavico/member/card_blank/coupon?wxid='+wxid;//游客查看礼券链接
                    console.log("++++++++++++++++++++++++++++++++");
                    console.log(nut.model.shake);
                    console.log(nut.model.member_id);
                    console.log("++++++++++++++++++++++++++++++++");

                    if(nut.model.member_id == "undefined" && nut.model.shake =="true"){
                        nut.model.isShowUrl = 'true';
                    }else{
                        nut.model.isShowUrl = 'false';
                    }
                }));

            }

        });

        this.step(function(){
            helper.db.coll('lavico/shake').findOne({_id:helper.db.id(seed.aid)},this.hold(function(err,doc){
                shake = doc;
                if(doc){
                    if(doc.content && doc.content!="null" && typeof(doc.content)!="undefined"){
                        nut.model.content = decodeURIComponent(doc.content).replace(/\{\@(.?wxid)\}/g, wxid);
                    }else{
                        nut.model.content = "undefined";
                    }

                    if(doc.pic && doc.pic!="null" && typeof(doc.pic)!="undefined"){
                        nut.model.pic = doc.pic;
                    }else{
                        nut.model.pic = "undefined";
                    }

                    if(new Date().getTime() < doc.startDate){
                        error = 'activity_no_start';
                        aid = "undefined";

                    }else if (new Date().getTime() > doc.endDate || doc.switcher == 'off'){
                        error = 'activity_was_end';
                        aid = "undefined";

                    }else{
                        error = 'null';
                    }
                }else{
                    nut.model.content = "undefined";
                    nut.model.pic = "undefined";
                    aid = "undefined";
                    error = 'activity_no_found';
                }
                console.log(doc);
            }));
        });

        this.step(function(){
            if(aid == 'undefined'){
                nut.model.aid = "undefined";
            }else{
                nut.model.aid = aid;//摇一摇活动ID
            }
        });


        this.step(function(){
            nut.model.uid = wxid;//uid是用户的wechatid
            nut.model.error = error;

        });
    },
    viewIn:function(){

        var member_id = $("#member_id").val();
        var uid = $("#uid").val();
        var aid = $("#aid").val();
        var error = $('#error').val();
        $("#shake_start").click(function(){

            if(aid == 'undefined'){
                if(error == 'activity_no_start'){
                    window.popupStyle2.on('很抱歉，活动未开始，敬请期待',function(event){});

                }else if(error == 'activity_was_end'||error == 'activity_no_found'){

                    window.popupStyle2.on('很抱歉，活动已结束',function(event){});

                }else{
                    window.popupStyle2.on('很抱歉，活动已结束',function(event){});
                }
                return false;
            }else{
                if( error == 'null'){
                    window.location.href = "/lavico/activity/shake_start03?uid="+uid+"&aid="+aid;
                }else{
                    window.popupStyle2.on('很抱歉，活动已结束',function(event){});
                }
            }

        });
    }
}