/**
 * Created by root on 14-4-8.
 */
(function() {
    var wechatapi, welabExtension;

    wechatapi = require("welab/lib/wechat-api.js");

    welabExtension = require('welab/extension.js');

    exports.load = function() {
        welabExtension.apps.announcement = {
            categories: ['图片'],
            type: '互动',
            icon: '/welab/apps/welcome/public/icon_s.png',
            on: true,
            title: '公告',
            desc: '系统公告',
            btns: [
                {
                    title: '列表',
                    controller: '/lavico/announcement/announcementIndex.js'
                }, {
                    title: '添加',
                    controller: '/lavico/announcement/addAnnouncement.js'
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
