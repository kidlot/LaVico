// Generated by CoffeeScript 1.6.3
(function() {
  var wechatapi, welabExtension;

  wechatapi = require("welab/lib/wechat-api.js");

  welabExtension = require('welab/extension.js');

  exports.load = function() {
    welabExtension.apps.bargain = {
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
        }, {
          title: '统计',
          controller: '/lavico/bargain/statistics'
        }
      ],
      start: function() {
        return this.on = true;
      },
      stop: function() {
        return this.on = false;
      }
    };
    wechatapi.registerReply(9, function(params, req, res, next) {
      if (params.Content === "我要侃价") {
        return helper.db.coll("lavico/bargain").find({
          startDate: {
            $lt: new Date().getTime()
          },
          stopDate: {
            $gt: new Date().getTime()
          }
        }).toArray(function(err, doc) {
          var docs, i, _i, _len;
          if (err) {
            console.log(err);
          }
          docs = [];
          docs.push({
            title: '价格你说了算',
            description: '商品价格我们说了不算，你说了算。和我们的机器人来侃个混天黑地吧。详情请点击。',
            picurl: 'http://192.168.0.254/lavico/public/images/u6.jpg',
            url: "http://" + req.headers.host + "/lavico/bargain/kv"
          });
          if (doc) {
            for (_i = 0, _len = doc.length; _i < _len; _i++) {
              i = doc[_i];
              docs.push({
                title: i.name,
                description: i.introduction,
                picurl: "http://" + req.headers.host + i.pic,
                url: "http://" + req.headers.host + "/lavico/bargain/detail?_id=" + i._id + '&wxid=' + params.FromUserName
              });
            }
          }
          return res.reply(docs);
        });
      } else {
        return next();
      }
    });
    return wechatapi.makeQueue();
  };

}).call(this);
