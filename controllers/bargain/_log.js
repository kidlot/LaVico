// Generated by CoffeeScript 1.6.3
(function() {
  module.exports = {
    layout: "welab/Layout",
    view: "lavico/templates/bargain/log.html",
    process: function(seed, nut) {
      var dTime, endTimeStamp, startTimeStamp, thisb, where, _page, _ym;
      _page = {};
      thisb = this;
      where = {
        action: "侃价",
        "data.step": 3
      };
      dTime = new Date();
      _ym = dTime.getFullYear() + "-" + (dTime.getMonth() + 1);
      startTimeStamp = seed.startDate ? new Date(seed.startDate + " 00:00:00").getTime() : new Date(_ym + "-01 00:00:00").getTime();
      endTimeStamp = seed.stopDate ? new Date(seed.stopDate + " 23:59:59").getTime() : new Date(_ym + "-31 23:59:59").getTime();
      if (seed.startDate && seed.stopDate) {
        where.createTime = {
          $gt: startTimeStamp,
          $lt: endTimeStamp
        };
      }
      helper.db.coll("lavico/user/logs").find(where).sort({
        createTime: -1
      }).page(50, seed.page || 1, this.hold(function(err, page) {
        var o, _i, _len, _ref, _results;
        _page = page || {};
        _ref = page.docs;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          o = _ref[_i];
          _results.push((function(o) {
            helper.db.coll("welab/customers").findOne({
              wechatid: o.wxid
            }, thisb.hold(function(err, doc2) {
              return o.user = doc2 || {};
            }));
            return helper.db.coll("lavico/bargain").findOne({
              _id: helper.db.id(o.data.productID)
            }, thisb.hold(function(err, doc2) {
              return o.product = doc2 || {};
            }));
          })(o));
        }
        return _results;
      }));
      return this.step(function() {
        nut.model.startDate = new Date(startTimeStamp + 60 * 60 * 8 * 1000).toISOString().substr(0, 10);
        nut.model.stopDate = new Date(endTimeStamp + 60 * 60 * 8 * 1000).toISOString().substr(0, 10);
        return nut.model.page = _page || {};
      });
    },
    viewIn: function() {
      $('#startDate').datetimepicker({
        format: 'yyyy-mm-dd',
        autoclose: true,
        minView: 2
      });
      return $('#stopDate').datetimepicker({
        format: 'yyyy-mm-dd',
        autoclose: true,
        minView: 2
      });
    },
    actions: {
      "export": {
        layout: null,
        view: null,
        process: function(seed, nut) {
          var endTimeStamp, startTimeStamp, thisb, where, _docs;
          thisb = this;
          where = {
            action: "侃价成交"
          };
          startTimeStamp = new Date(seed.startDate + " 00:00:00").getTime();
          endTimeStamp = new Date(seed.stopDate + " 23:59:59").getTime();
          if (seed.startDate && seed.stopDate) {
            where.createTime = {
              $gt: startTimeStamp,
              $lt: endTimeStamp
            };
          }
          _docs = {};
          helper.db.coll("lavico/user/logs").find(where).sort({
            createTime: -1
          }).toArray(this.hold(function(err, docs) {
            var o, _i, _len, _results;
            _docs = docs || {};
            _results = [];
            for (_i = 0, _len = docs.length; _i < _len; _i++) {
              o = docs[_i];
              _results.push((function(o) {
                helper.db.coll("welab/customers").findOne({
                  wechatid: o.wxid
                }, thisb.hold(function(err, doc2) {
                  return o.user = doc2 || {};
                }));
                return helper.db.coll("lavico/bargain").findOne({
                  _id: helper.db.id(o.data.productID)
                }, thisb.hold(function(err, doc2) {
                  return o.product = doc2 || {};
                }));
              })(o));
            }
            return _results;
          }));
          return this.step(function() {
            var cardid, conf, i, nodeExcel, o, result, _i, _len;
            nodeExcel = require('excel-export');
            conf = {};
            conf.cols = [
              {
                caption: 'OPENID',
                type: 'string'
              }, {
                caption: '卡号',
                type: 'string'
              }, {
                caption: '昵称',
                type: 'string'
              }, {
                caption: '手机号',
                type: 'string'
              }, {
                caption: '时间',
                type: 'string'
              }, {
                caption: '成交价',
                type: 'string'
              }, {
                caption: '产品名称',
                type: 'string'
              }
            ];
            conf.rows = [];
            for (i = _i = 0, _len = _docs.length; _i < _len; i = ++_i) {
              o = _docs[i];
              cardid = "";
              if (o.user.HaiLanMemberInfo) {
                cardid = o.user.HaiLanMemberInfo.memberCardNumber;
              }
              conf.rows.push([o.wxid, cardid, o.user.realname, o.user.mobile, new Date(o.createTime + 60 * 60 * 8 * 1000).toISOString().substr(0, 10), o.data.price, o.product.name]);
            }
            result = nodeExcel.execute(conf);
            this.res.setHeader('Content-Type', 'application/vnd.openxmlformats');
            this.res.setHeader("Content-Disposition", "attachment; filename=Report.xlsx");
            this.res.write(result, 'binary');
            return this.res.end();
          });
        }
      }
    }
  };

}).call(this);
