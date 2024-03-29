// Generated by CoffeeScript 1.6.3
(function() {
  var wechatapi, welabExtension;

  wechatapi = require("welab/lib/wechat-api.js");

  welabExtension = require('welab/extension.js');

  exports.load = function() {
    return welabExtension.apps.shake = {
      categories: ['图片'],
      type: '互动',
      icon: '/welab/apps/welcome/public/icon_s.png',
      on: true,
      title: '摇一摇',
      desc: '摇一摇',
      btns: [
        {
          title: '列表',
          controller: '/lavico/shake'
        },
        {
          title: '添加',
          controller: '/lavico/shake/index:add'
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
