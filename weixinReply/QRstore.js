/**
 * Created by David Xu on 7/23/14.
 */
(function() {
    var wechatapi, welabExtension;

    wechatapi = require("welab/lib/wechat-api.js");

    welabExtension = require('welab/extension.js');

    exports.load = function() {
        return welabExtension.apps.QRstore = {
            categories: ['图片'],
            type: '沟通',
            icon: '/welab/apps/welcome/public/icon_s.png',
            on: true,
            title: '门店',
            desc: '门店数据导入',
            btns: [
                {
                    title: '管理',
                    controller: '/lavico/QRstore/index'
                }
            ],
            start: function() {
                return this.on = true;
            },
            stop: function() {
                return this.on = false;
            }
        };
    };

}).call(this);
