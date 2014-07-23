// Generated by CoffeeScript 1.6.3
(function() {
    var wechatapi, welabExtension;

    wechatapi = require("welab/lib/wechat-api.js");

    welabExtension = require('welab/extension.js');

    exports.load = function() {
        welabExtension.apps.tag = {
            categories: ['图片'],
            type: '互动',
            icon: '/welab/apps/welcome/public/icon_s.png',
            on: true,
            title: '标签管理',
            desc: '标签管理',
            btns: [
                {
                    title: '列表',
                    controller: '/lavico/tags/Taglist'
                }, {
                    title: '添加',
                    controller: '/lavico/tags/addTag'
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

