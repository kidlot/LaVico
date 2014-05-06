/**
 * Created by David Xu on 3/17/14.
 * 进入会员管理页面，首先先进入本页面，然后根据不同类型的会员进入不同的页面 card_blank/index or card_member/index
 */

var middleware = require('lavico/lib/middleware.js');//引入中间件

module.exports = {
    layout:null,
    view:'lavico/templates/member/index.html',
    process:function(seed,nut){
        var wxid = seed.wxid ? seed.wxid : 'undefined';
        nut.model.wxid = wxid;
        var type = '';
        console.log('wxid:'+wxid);
        //根据WXID来判断会员的类型
        //判断会员接口
        //返回值 type = card_blank || card_member

        if(wxid =='undefined'){
             //此情况属于意外情况，必须强制停止
            this.terminate();
        }else{

             this.step(function(){
                /*第一步 查询此用户是否为会员*/
                console.log('wxid:'+wxid);
                helper.db.coll("welab/customers").findOne({wechatid:wxid},this.hold(function(err, doc){
                     if(err){
                         throw err;
                     }
                     if(doc){
                         console.log(doc);
                         console.log('card_member');
                         type = 'card_member';
                         return type;

                     }else{
                         console.log(doc);
                         console.log('card_blank');
                         type = 'card_blank';
                         return type;
                     }
                }));

            });

            this.step(function(type){
                /*第二步 跳转会员的页面*/

                if(type == "card_blank"){
                    this.res.writeHead(302, {'location':'/lavico/member/card_blank/index?wxid='+wxid})
                    //跳转 lavico/member/card_blank/index
                }else if(type == 'card_member'){
                    this.res.writeHead(302, {'location':'/lavico/member/card_member/index?wxid='+wxid})
                    //跳转 lavico/memeber/card_blank/index
                }else{
                    //this.res.writeHead(302, {'location':'/lavico/index?wxid='+wxid})
                    //返回错误Error
                    //跳转到 lavico/index
                }
                this.res.end();
            });

        }
    },
    viewIn:function(){

    }
}