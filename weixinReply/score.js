// Generated by CoffeeScript 1.6.3
(function() {
    var wechatapi, welabExtension;

    wechatapi = require("welab/lib/wechat-api.js");

    welabExtension = require('welab/extension.js');

    exports.load = function() {
        welabExtension.apps.score = {
            categories: ['图片'],
            type: '互动',
            icon: '/welab/apps/register/public/icon_s.png',
            on: true,
            title: '抢积分',
            desc: '答题抢积分',
            btns: [
                {
                    title: '添加',
                    controller: '/lavico/answerQuestion/question/addQuestion'
                }, {
                    title: '列表',
                    controller: '/lavico/answerQuestion/themeList'
                },{
                    title: '统计',
                    controller: '/lavico/answerQuestion/statistics/statistics_list'
                }
            ],
            start: function() {
                return this.on = true;
            },
            stop: function() {
                return this.on = false;
            }
        };

        return wechatapi.makeQueue();
    };

}).call(this);
