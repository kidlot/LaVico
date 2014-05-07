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
                    this.res.writeHead(302, {'location':'/lavico/member/card_member/index?wxid='+wxid});
                    this.res.end();
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


    },
    viewIn:function(){
        jQuery(document).ready(function($) {

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

        });
    }
}