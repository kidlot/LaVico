wechatapi = require("welab/lib/wechat-api.js");
welabExtension = require('welab/extension.js');


exports.load =  ()->

  welabExtension.apps.bargain = {
    categories: ['图片']
    , type: '互动'
    , icon: '/welab/apps/welcome/public/icon_s.png'
    , on: true
    , title: '我要侃价'
    , desc: '我要侃价'
    , btns: [
        {
          title: '管理'
        , controller: '/lavico/bargain'
        }
      ]
    , start: ()->
        this.on = true;

    , stop: ()->
        this.on = false;

  }
