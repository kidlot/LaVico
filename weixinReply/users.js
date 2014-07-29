// Generated by CoffeeScript 1.6.3
(function() {
    var wechatapi, welabExtension;

    wechatapi = require("welab/lib/wechat-api.js");

    welabExtension = require('welab/extension.js');

    exports.load = function() {
        return welabExtension.apps.users = {
            categories: ['图片'],
            type: '系统',
            icon: '/welab/apps/welcome/public/icon_s.png',
            on: true,
            title: '用户管理',
            desc: '用户管理',
            btns: [
                {
                    title: '列表',
                    controller: '/lavico/users/userslist'
                },{
                    title:"添加用户",
                    controller:'/lavico/users/adduser'
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
