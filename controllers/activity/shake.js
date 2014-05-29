/*
* 摇一摇后台管理页面
* URL：{host}/lavico/shake
* */

var middleware = require('../../lib/middleware.js');
module.exports = {
    layout: "lavico/layout",
    view: "lavico/templates/activity/shake.html",
    process:function(seed,nut){

        var wxid = seed.uid ? seed.uid : 'undefined';//uid是用户的wechatid
        var aid = seed.aid ? seed.aid : 'undefined';//摇一摇活动ID
        nut.model.fromWelab = seed.fromWelab || ""

        var member_id;
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
            helper.db.coll('welab/customers').findOne({wechatid:wxid},this.hold(function(err,doc){
                if(!doc){
                    nut.disable();//不显示模版
                    this.res.writeHead(200, { 'Content-Type': 'application/json' });
                    this.res.write('{"error":"wxid_no_found"}');
                    this.res.end();
                    this.terminate();
                }
            }));
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
                    if(doc && doc.HaiLanMemberInfo && doc.HaiLanMemberInfo.memberID && doc.HaiLanMemberInfo.action=='bind' ){
                        member_id =  doc.HaiLanMemberInfo.memberID;
                    }else{
                        member_id = 'undefined';
                    }
                }));

            }

        });

        this.step(function(){

            if(member_id == "undefined"){
                //缺少微信ID参数，强制中断
                //直接跳转
                nut.model.member_id = "undefined";
            }else{
                nut.model.member_id = "normal";
            }
        });

        this.step(function(){
            if(aid == 'undefined'){
                nut.model.aid = "undefined";
            }else{
                nut.model.aid = "normal";
            }
        });


        this.step(function(){
            nut.model.uid = seed.uid;//uid是用户的wechatid
            nut.model.aid = seed.aid || 'undefined';//摇一摇活动ID
        });
    },
    viewIn:function(){
        var member_id = $("#member_id").val();
        var uid = $("#uid").val();
        var aid = $("#aid").val();
        $("#shake_start").click(function(){
            if(member_id != 'normal'){
                window.popupStyle2.on("您还不是LaVico的会员，请先注册会员",function(event){
                    window.location.href = "/lavico/member/card_blank/register?wxid="+uid;
                });
            }else{

                if(aid == 'undefined'){
                    window.popupStyle2.on('活动已经被结束了，以后再来参加吧!',function(event){});
                    return false;
                }else{
                    window.location.href = "/lavico/activity/shake_start?uid="+uid+"&aid="+aid;
                }
            }
        });
    }
}