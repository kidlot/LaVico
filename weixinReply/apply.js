wechatapi = require("welab/lib/wechat-api.js");

exports.load = function () {

    wechatapi.registerReply(9, function (params, req, res, next) {
        if (params.Content === "申请会员") {
        	console.log('ccccccccc');
            res.reply('报名成功！⾸先为你的贺卡写上祝福吧（请回复20字以内的祝福内容）');
        }else{
            return next();
        }
    })

    wechatapi.makeQueue();

};

