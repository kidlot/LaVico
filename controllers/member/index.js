/**
 * Created by David Xu on 3/17/14.
 * 进入会员管理页面，首先先进入本页面，然后根据不同类型的会员进入不同的页面 card_blank/index or card_member/index
 */

//var middleware = require('lavico/lib/middleware.js');//引入中间件

module.exports = {
    layout:'lavico/member/layout',
    view:'lavico/templates/member/index.html',
    process:function(seed,nut){

        /*先判断微信id是否存在*/

        var wxid = seed.wxid ? seed.wxid : 'undefined';//预先定义微信ID
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

        /*判断用户类型，申请会员卡或者绑定会员卡*/
        this.step(function(){

            nut.model.wxid = wxid;
            helper.db.coll('welab/customers').findOne({wechatid:wxid},this.hold(function(err,doc){

                var MEMBER_ID = doc.HaiLanMemberInfo ? doc.HaiLanMemberInfo.memberID : "undefined" ;
                var bindStatus = doc.HaiLanMemberInfo ? doc.HaiLanMemberInfo.action : "undefined" ;


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


            }));
        });

        this.step(function(){

            nut.model.wxid = wxid ;

            /*会员公告*/
            nut.model.announcement = "/lavico/announcement/showIndex?wxid="+wxid;

            /*专属礼券*/
            nut.model.coupon = "/lavico/member/card_member/coupon/index?wxid="+wxid;

            /*积分与兑换*/
            nut.model.points = "/lavico/member/card_member/points/index?wxid="+wxid;

            /*消费记录*/
            nut.model.buy = "/lavico/member/card_member/buy?wxid="+wxid;

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

        });


    },
    viewIn:function(){


        var wxid = $('#wxid').val();
        $(".fade").css("display","block");

        /*申请会员卡*/
        $(".applybtn").click(function(){
            window.location.href="/lavico/member/card_blank/register?wxid="+wxid;
        });

        /*绑定会员卡*/
        $(".bangdingbtn").click(function(){
            window.location.href="/lavico/member/card_blank/bind?wxid="+wxid;
        });

        /*bind*/
        if($('#bindStatus').val() == 'bind'){
            $(".fade").css("display","none");
        }

    }
}