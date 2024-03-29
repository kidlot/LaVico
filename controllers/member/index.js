/**
 * Created by David Xu on 3/17/14.
 * 进入会员管理页面，首先先进入本页面，然后根据不同类型的会员进入不同的页面 card_blank/index or card_member/index
 */

var middleware = require('lavico/lib/middleware.js');//引入中间件

module.exports = {
    layout:'lavico/layout',
    view:'lavico/templates/member/index.html',
    process:function(seed,nut){

        var wxid = seed.wxid || undefined;
        var memberInfo;//用户信息
        var card_number;//显示在会员中心的帐号
        nut.model.error = 'false';
        var announcement;
        var resultlist;
        var readcount=0;

        if(!wxid || wxid == '{wxid}'){

            if(this.req.session.oauthTokenInfo && this.req.session.oauthTokenInfo.openid){

                console.log("从SESSION中读取OPENID",this.req.session.oauthTokenInfo.openid)
                wxid = this.req.session.oauthTokenInfo.openid
            }else{

                // 通过oauth获取OPENID
                if(process.wxOauth){

                    if(!seed.code){

                        var url = process.wxOauth.getAuthorizeURL("http://"+this.req.headers.host+"/lavico/member/index","123","snsapi_base")
                        console.log("通过oauth获得CODE的url",url)
                        this.res.writeHeader(302, {'location': url })  ;
                    }else{

                        process.wxOauth.getAccessToken(seed.code,this.hold(function(err,doc){

                            if(!err){
                                var openid = doc.data.openid
                                wxid = openid || undefined;
                                console.log("通过oauth获得信息",doc)
                                this.req.session.oauthTokenInfo = doc.data;
                            }else{
                                console.log("通过oauth获得ID超时。",err)
                                this.res.writeHeader(302, {'location': "http://"+this.req.headers.host+"/lavico/member/index"})  ;
                            }
                        }))
                    }

                }
            }
        }

        /*先判断微信id是否存在*/
        this.step(function(){
            if(wxid == undefined){
                nut.disable();//不显示模版
                this.res.writeHead(200, { 'Content-Type': 'application/json' });
                this.res.write('{"error":"wxid_is_empty"}');
                this.res.end();
                this.terminate();
            }
        });
        this.step(function(){
            helper.db.coll('welab/customers').findOne({wechatid:wxid},this.hold(function(err, doc){
                if(!doc){
                    nut.disable();//不显示模版
                    this.res.writeHead(200, { 'Content-Type': 'application/json' });
                    this.res.write('{"error":"wxid_no_bind_to_welab"}');
                    this.res.end();
                    this.terminate();
                }else{
                   nut.model.wxid = wxid;
                   memberInfo =  doc;
                }
            }));
        });


        this.step(function(){
            //获取我的会员卡的头部显示的卡号Member/Info/9121535
            console.log(memberInfo);

            if(memberInfo.HaiLanMemberInfo&&memberInfo.HaiLanMemberInfo.memberID&&memberInfo.HaiLanMemberInfo.cardNumber&&memberInfo.HaiLanMemberInfo.action=='bind'){

                card_number = memberInfo.HaiLanMemberInfo.cardNumber;

            }else{

                if(memberInfo.HaiLanMemberInfo&&memberInfo.HaiLanMemberInfo.memberID){
                    middleware.request( "Member/Info/"+memberInfo.HaiLanMemberInfo.memberID,{
                        }
                        ,this.hold(function(err,req_doc){
                            var _info = JSON.parse(req_doc);
                            card_number = _info.info.MEM_CARD_NO;
                            console.log(card_number);
                            helper.db.coll('welab/customers').update({wechatid:wxid},{
                                $set:{
                                    'HaiLanMemberInfo.cardNumber':card_number,
                                    'HaiLanMemberInfo.lastModified':new Date().getTime()
                                }
                            },function(err,doc){
                                err&&console.log(doc);
                            });

                        }));
                }else{
                    if(memberInfo.HaiLanMemberInfo&&memberInfo.HaiLanMemberInfo.memberID==undefined){
                        nut.model.error = 'missing_info';//丢失信息
                    }
                }

            }
        });
        /*判断用户类型，申请会员卡或者绑定会员卡*/
        this.step(function(){

            if(memberInfo.HaiLanMemberInfo&&memberInfo.HaiLanMemberInfo.memberID){
                var MEMBER_ID = memberInfo.HaiLanMemberInfo.memberID;
            }else{
                var MEMBER_ID = '';
            }
            var bindStatus = memberInfo.HaiLanMemberInfo ? memberInfo.HaiLanMemberInfo.action : "undefined" ;
            var type = memberInfo.HaiLanMemberInfo ? memberInfo.HaiLanMemberInfo.type : "undefined";

            if(bindStatus == 'bind'){
                nut.model.bindStatus = 'bind';
                /*自动跳转到card_member主页*/

            }else if(bindStatus == 'unbind'){
                nut.model.bindStatus = 'unbind';
                /*自动跳转到card_member主页*/
            }else{
                //undefined;
                nut.model.bindStatus = 'unbind';
                /*自动跳转到card_member主页*/
            }

            if(type >= 1 && type <=3){
                nut.model.type = String(type);

            }else{
                //undefined;
                nut.model.type = 0;
            }

            nut.model.MEMBER_ID = MEMBER_ID;
            nut.model.cardNumber = card_number;

        });

        this.step(function(){

            nut.model.wxid = wxid ;

            /*会员公告*/
            nut.model.announcement = "/lavico/announcement/showIndex?wxid="+wxid;

            /*专属礼券*/
            nut.model.coupon = "/lavico/member/card_member/coupon/index?wxid="+wxid;

            /*积分与兑换*/

            /*积分明细*/
            nut.model.points = "/lavico/member/card_member/points/index?wxid="+wxid;
            /*积分兑换*/
            nut.model.reedem = "/lavico/reedem/showList?wechatId="+wxid;

            /*消费记录*/
            //nut.model.buy = "/lavico/member/card_member/buy?wxid="+wxid;
            nut.model.buy = "/lavico/consumeDetail/details?wechatId="+wxid;

            /*收藏清单*/
            nut.model.fav = "/lavico/lookbook/favorites?wxid="+wxid;


            /*会员特权*/

            /*微会员尊享*/
            nut.model.weiCard = "/lavico/member/benefit/index:weiCard?wxid="+wxid;
            /*VIP尊享*/
            nut.model.vipCard = "/lavico/member/benefit/index:vipCard?wxid="+wxid;
            /*白金VIP卡尊享*/
            nut.model.goldCard = "/lavico/member/benefit/index:goldCard?wxid="+wxid;

            /*个人资料*/
            nut.model.info = "/lavico/member/card_member/info?wxid="+wxid;

            /*解绑会员卡*/
            nut.model.unbind = "/lavico/member/card_member/unbind?wxid="+wxid;

            /*门店地址*/
            nut.model.store = "/lavico/store/currentCustomerLocation?wxid="+wxid;

            /*游客查看优惠券*/
            nut.model.blankCoupon = "/lavico/member/card_blank/coupon?wxid="+wxid;

            /*申领会员卡*/
            nut.model.register = "/lavico/member/card_blank/register?wxid="+wxid;;

            /*绑定会员卡*/
            nut.model.bind = "/lavico/member/card_blank/bind?wxid="+wxid;

        });

        this.step(function(){
            helper.db.coll("welab/customers").findOne({"wechatid":wxid},this.hold(function(err,doc){
                if(err) throw err;
                if(doc && doc.announcement){
                    announcement = doc.announcement;
                }
            }));
        })

        this.step(function(){
            helper.db.coll("lavico/announcement").find({"isOpen":true}).sort({"createTime":-1}).toArray(this.hold(function(err,doc){
                if(err) throw err;
                resultlist = doc || {};
            }));
        })

        this.step(function(){
            if(resultlist.length>0 && typeof(resultlist)!="undefined"){
                for(var i=0;i<resultlist.length;i++){
                    resultlist[i].isRead="false";
                }
                if(typeof(announcement)!="undefined"){
                    for(var i=0;i<resultlist.length;i++){
                        for(var j=0;j<announcement.length;j++){
                            if(announcement[j]==resultlist[i]._id){
                                resultlist[i].isRead="true";
                            }
                        }
                    }
                    for(var j=0;j<resultlist.length;j++){
                        if(resultlist[j].isRead && resultlist[j].isRead=="false"){
                            readcount++;
                        }
                    }
                }else{
                    readcount=1;
                }
            }else{
                readcount=0;
            }
            nut.model.count = readcount;
        })

    },
    viewIn:function(){

        $('#loading').hide();//隐藏加载框

        var wxid = $('#wxid').val();
        var error = $('#error').val();
        /*bind*/
        if(error == 'false'){
            if($('#bindStatus').val() == 'bind'){
                /*计算当前用户可用的优惠券数*/
                $.ajax({
                    type: "GET",
                    url: "/lavico/member/index:getUserEffectiveCouponsNum",
                    data: {"wxid":wxid},
                    dataType: "json",
                    success: function(data){
                        if(data.error == "false"){
                            var _count = data.count;
                            var _html = "("+_count+"张未使用)";
                            $('#count').html(_html);
                        }else{
                            $('#count').html('');
                        }
                    }
                });

            }else{
                $('#count').html('');
            }
        }else{
            window.popupStyle2.on("网络不稳定，请稍后再尝试",function(event){});
        }

        /*掩藏分享按钮*/
        window.hideShareButtion.on();
    },
    actions:{
        getUserEffectiveCouponsNum:{
            layout:null,
            view:null,
            process:function(seed,nut){
                nut.disable();
                var wxid = seed.wxid || 'undefined';
                var couponData;

                this.step(function(){
                    if(wxid == 'undefined'){
                        nut.disable();//不显示模版
                        this.res.writeHead(200, { 'Content-Type': 'application/json' });
                        this.res.write('{"error":"wxid_is_empty"}');
                        this.res.end();
                        this.terminate();
                    }
                });

                this.step(function(){
                    helper.db.coll('welab/customers').findOne({wechatid:wxid},this.hold(function(err, doc){
                        if(!doc){
                            nut.disable();//不显示模版
                            this.res.writeHead(200, { 'Content-Type': 'application/json' });
                            this.res.write('{"error":"wxid_no_bind_to_welab"}');
                            this.res.end();
                            this.terminate();
                        }
                    }));
                });

                this.step(function(){
                    helper.db.coll('welab/customers').findOne({wechatid:wxid},this.hold(function(err, doc){
                        if(doc && doc.HaiLanMemberInfo && doc.HaiLanMemberInfo.memberID ){
                            member_id =  doc.HaiLanMemberInfo.memberID;
                        }else{
                            nut.disable();//不显示模版
                            this.res.writeHead(200, { 'Content-Type': 'application/json' });
                            this.res.write('{"error":"member_id_is_empty"}');
                            this.res.end();
                            this.terminate();
                        }
                    }));
                });
                this.step(function(){

                    var requestData = {
                        'memberId' : member_id,
                        'perPage':0,
                        'pageNum':1
                    };

                    middleware.request( "Coupon/GetCoupons", requestData,this.hold(function(err,doc){

                        couponData = JSON.parse(doc);

                        helper.db.coll("welab/feeds").insert(
                            {
                                'createTime':new Date().getTime(),
                                'wxid':seed.wxid,
                                'action':"check_effective_coupon_num",
                                'request':requestData,
                                'reponse':couponData
                            },this.hold( function(err, doc){
                                err&console.log(doc);
                            })
                        );
                        //记录用户动作
                    }));
                });
                this.step(function(){

                    var effectiveCouponsCount = couponData.total;
                    nut.disable();//不显示模版
                    this.res.writeHead(200, { 'Content-Type': 'application/json' });
                    this.res.write('{"error":"false","count":"'+effectiveCouponsCount+'"}');
                    this.res.end();
                });

            }
        }

    }
}