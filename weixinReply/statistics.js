/**
 * Created by David Xu on 7/7/14.
 */
(function() {
    var wechatapi, welabExtension;

    wechatapi = require("welab/lib/wechat-api.js");

    welabExtension = require('welab/extension.js');

    exports.load = function() {
        welabExtension.apps.statistics = {
            categories: ['图片'],
            type: '互动',
            icon: '/welab/apps/welcome/public/icon_s.png',
            on: true,
            title: '统计',
            desc: '分享与点击菜单统计',
            btns: [
               {
                    title: '统计',
                    controller: '/lavico/statistics/index'
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