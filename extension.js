var wechatutil = require("welab/controllers/wechat-api/util.js") ;
var bargain = require("./weixinReply/bargain.js") ;
var score=require("./weixinReply/score.js");
var reedem=require("./weixinReply/reedem.js");
var announcement=require("./weixinReply/announcement.js");
var activity = require("./weixinReply/activity.js") ;
var shake = require("./weixinReply/shake.js") ;
var lookbook = require("./weixinReply/lookbook.js") ;
var maps = require("./weixinReply/maps.js") ;
var rewriteWelab = require("./rewriteWelab.js") ;
var sportsman = require("./weixinReply/sportsman.js");
var statistics = require("./weixinReply/statistics.js") ;
var QRstore = require("./weixinReply/QRstore.js");
var wechatapi = require("welab/lib/wechat-api.js") ;
var guess = require("./weixinReply/guess.js") ;
var tag = require("./weixinReply/tag.js") ;
exports.onload = function(application){


    // 我要侃价
    bargain.load()
    //答题抢积分
    score.load();
    //公告
    announcement.load();
    //积分兑换
    reedem.load();

	activity.load();
	shake.load();
    // 精英搭配
    lookbook.load();

    // 重写welab功能
    rewriteWelab.load();

    //门店查询
    maps.load();

    //型男测试
    sportsman.load();

    //竞猜型
    guess.load();

    //标签管理
    tag.load();

    //应用统计
    //statistics.load();

    //门店数据导入
    QRstore.load();


    // 覆盖WELAB的LAYOUT
    var welabLayout = require("welab/controllers/Layout")
    welabLayout.view = "lavico/templates/welabLayout.html";

    // 去掉正在使用中的
    helper.template("welab/templates/dashboard.html",this.hold(function(err,tpl){

        if(err) throw err ;
        tpl.$(".more-info").hide() ;

        // 重新编译模板
        tpl.compile() ;
    })) ;

    // 去掉应用
    var welabExtension = require("welab/extension.js");
    delete welabExtension.apps.register;
    delete welabExtension.apps.xiaoi;
    delete welabExtension.apps.sends;
    delete welabExtension.apps.webox;
    delete welabExtension.apps.photowall;
    delete welabExtension.apps.rurqqw;
    delete welabExtension.apps.map;
    delete welabExtension.apps.ar;
    delete welabExtension.apps.mallfirework;
    delete welabExtension.apps.qrcode;

    welabExtension.apps.qrcode = {
        categories: ['用户']
            , type: '沟通'
            , icon: '/welab/apps/qrcode/public/icon_s.png'
            , isSwitch : false
            , on: false
            , replies: {
            9: [ function(params,req,res,next){next()} ]
        }
    , title: '参数二维码'
            , desc: '参数二维码'
            , btns: [
            {
                title: '管理'
                , controller: '/welab/apps/qrcode/form'
            }

        ]
            , start: function(){
            this.on = true;
        }
    , stop: function(){
            this.on = false;
        }
    }



    /**
     * welcome
     */

    wechatapi.registerReply(9,function(msg,req,res,next){

        if( msg.MsgType == "event" && msg.EventKey && msg.Event=='subscribe'){

            if(msg.Event=='subscribe'){

                var eventkey = /^qrscene_(.*)/i.exec(msg.EventKey)[1]
            }

            helper.db.coll('welab/customers').update({wechatid: msg.FromUserName}, {$addToSet: {source: eventkey}}, function (err, doc) {
                err && console.log(doc);
            });

        }else{
            next()
        }
    })
    wechatapi.makeQueue() ;



    /*
    * 更新个人信息资料
    * */
    var _time = 1000*60*60;
    var timer = setInterval(function(){
             http = require('http');
             options = {
                host: '127.0.0.1',
                port: 80,
                path: '/lavico/member/card_member/info:updateUserInfo',
                method: 'GET'
             };
             req = http.request(options, function(res) {
                 res.setEncoding('utf8');
                 var body='';
                 res.on('data', function(data) {
                     body +=data;
                     console.log(data);
                 });
             });
             //req.write(post_data);
             console.log(req.end());
         },_time);

}


