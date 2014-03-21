Steps = require("ocsteps") ;
accessToken = require "../../welab/controllers/access-token.js" ;
http = require "http" ;
wechatutil = require("welab/controllers/wechat-api/util.js");

exports.pad = (num, n) ->
    Array(n-(''+num).length+1).join(0)+num;

exports.toPRC = (strDate)->
    return new Date(strDate).getTime() + (new Date().getTimezoneOffset() * 60 * 1000)


# update user
exports.updateUserInfo = (wxid, doc)->
  helper.db.coll("welab/customers").update({wechatid: wxid}, {$set: doc}, (err, doc)->

  )

# reply
exports.replyForDb = (tag, params)->
  _tag = eval("/^" + tag + "$/i");
  helper.db.coll("welab/reply").findOne({ tags: _tag, isValid: true }, (err, doc) ->
    reply = wechatutil.makeReply(params[0], doc, params[1]);
    params[2].reply(reply);
  )
