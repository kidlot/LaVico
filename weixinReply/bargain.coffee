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
        },
        {
          title: '统计'
        , controller: '/lavico/bargain/statistics'
        }
      ]
    , start: ()->
        this.on = true;

    , stop: ()->
        this.on = false;

  }
  wechatapi.registerReply(9, (params, req, res, next) ->

      if (params.Content == "我要侃价")

          helper.db.coll("lavico/bargain").find({startDate:{$lt:new Date().getTime()},stopDate:{$gt:new Date().getTime()}}).toArray((err, doc) ->

            console.log(err) if err

            docs = []
            docs.push({
              title: '价格你说了算',
              description: '商品价格我们说了不算，你说了算。和我们的机器人来侃个混天黑地吧。详情请点击。',
              picurl: 'http://192.168.0.254/lavico/public/images/u6.jpg',
              url: "http://"+req.headers.host+"/lavico/bargain/kv"
            })

            if (doc)
              for i in doc
                docs.push({
                  title: i.name,
                  description: i.introduction,
                  picurl: "http://"+req.headers.host+i.pic,
                  url: "http://"+req.headers.host+"/lavico/bargain/detail?_id="+i._id+'&wxid='+params.FromUserName
                })

            res.reply(docs);
          )

      else
        next()
  )

  wechatapi.makeQueue();


