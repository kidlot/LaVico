var wechatapi = require("welab/lib/wechat-api.js");
var welabExtension = require('welab/extension.js');

exports.load = function () {
    welabExtension.apps.lookbook = {
      categories: ['图片'],
      type: '互动',
      icon: '/welab/apps/welcome/public/icon_s.png',
      on: true,
      title: '精英搭配',
      desc: '精英搭配',
      btns: [
        {
          title: '列表',
          controller: '/lavico/lookbook'
        },
        {
          title:'添加',
          controller:'/lavico/lookbook/form'

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
