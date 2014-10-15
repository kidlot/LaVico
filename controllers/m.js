// Generated by CoffeeScript 1.6.3
(function() {

    var http = require('http');

    exports.getUserNickname = function(openid, cb) {
        console.log("openid",openid)
        var options, req;

        options = {
            host: 'api.weixin.qq.com',
            port: 80,
            path: "/cgi-bin/user/info?lang=zh_CN&openid="+openid+"&access_token=G4zOrM5SEPl4vE_XIPORD75u9XfDq8uwmCEajMhxVDE8DDoWFTjYDxCRDH9T0RuR705dXr5nqZFXSpZ6QLZqa26h0Spd7XQwErWCiNXotW0",
            method: 'GET'
        };

        console.log("请求用户信息：",options)
        req = http.request(options, function(res) {
            res.setEncoding('utf8');
            var body='';
            res.on('data', function(data) {
                body +=data;
            });
            res.on('end',function(){
                return cb(null,body);
            })
            return req.on('error', function(e) {
                return cb(e);
            });
        });

        return req.end();
    };

}).call(this);