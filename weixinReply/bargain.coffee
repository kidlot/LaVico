wechatapi = require("welab/lib/wechat-api.js");
welabExtension = require('welab/extension.js');


exports.load =  ()->

  welabExtension.apps.bargain = {
    categories: ['图片']
    , type: '定制应用'
    , icon: '/welab/apps/photowall/public/icon_s.png'
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



  wechatapi.registerReply(9, (params, req, res, next) ->
      if (params.Content == "我要侃价")


      else
        next()
  )

  wechatapi.makeQueue();


