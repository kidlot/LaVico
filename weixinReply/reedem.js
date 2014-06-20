// Generated by CoffeeScript 1.6.3
(function() {
    var wechatapi, welabExtension;

    wechatapi = require("welab/lib/wechat-api.js");

    welabExtension = require('welab/extension.js');

    exports.load = function() {
        welabExtension.apps.reedem = {
            categories: ['图片'],
            type: '互动',
            icon: '/welab/apps/welcome/public/icon_s.png',
            on: true,
            title: '积分兑换',
            desc: '积分兑换',
            btns: [
                {
                    title: '列表',
                    controller: '/lavico/reedem/reedem_list'
                }, {
                    title: '添加',
                    controller: '/lavico/reedem/addReedem'
                },{
                    title: '加分',
                    controller: '/lavico/reedem/addCoin_Test'
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
