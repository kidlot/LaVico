var wechatapi = require("welab/lib/wechat-api.js");
var welabExtension = require('welab/extension.js');

exports.load = function () {
    welabExtension.apps.lookbook = {
      categories: ['图片'],
      type: '定制应用',
      icon: '/welab/apps/photowall/public/icon_s.png',
      on: true,
      title: '精英搭配',
      desc: '精英搭配',
      btns: [
        {
          title: '管理',
          controller: '/lavico/lookbook'
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
