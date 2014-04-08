// Generated by CoffeeScript 1.6.3
(function() {
  var wechatapi, welabExtension;

  wechatapi = require("welab/lib/wechat-api.js");

  welabExtension = require('welab/extension.js');

  exports.load = function() {
    return welabExtension.apps.bargain = {
      categories: ['图片'],
      type: '定制应用',
      icon: '/welab/apps/photowall/public/icon_s.png',
      on: true,
      title: '我要侃价',
      desc: '我要侃价',
      btns: [
        {
          title: '管理',
          controller: '/lavico/bargain'
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