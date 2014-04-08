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
            type: '定制应用',
            icon: '/welab/apps/register/public/icon_s.png',
            on: true,
            title: '公告',
            desc: '系统公告',
            btns: [
                {
                    title: '添加公告',
                    controller: '/lavico/announcement/addAnnouncement.js'
                }, {
                    title: '公告列表',
                    controller: '/lavico/announcement/announcementIndex.js'
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
