/**
 * 会员 - 我的会员卡 (已开卡状态)
 * 接口查询：会员卡号、卡类型、未使用的礼券、信息完善与否
 * url:/lavico/member/card_member/index
 * template:/lavico/templates/member/card_member/index.html
 */

var middleware = require('lavico/lib/middleware.js');//引入中间件

module.exports = {
    layout:'lavico/member/layout',
    view:'lavico/templates/member/card_member/index.html',
    process:function(seed,nut){

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

        });

    }
}