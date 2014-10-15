// Generated by CoffeeScript 1.6.3
(function() {

    var http = require('http');

    exports.getAccessToken = function(cb) {
        var options, req;

        options = {
            host: 'api.weixin.qq.com',
            port: 80,
            path: "/cgi-bin/token?grant_type=client_credential&appid=wx079e02ae6421c523&secret=1574abeb9b3f9404e722460afb640eeb",
            method: 'GET'
        };

        console.log("获取AccessToken：",options)
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

    exports.getUserNickname = function(openid,access_token, cb) {
        console.log("openid",openid)
        var options, req;

        options = {
            host: 'api.weixin.qq.com',
            port: 80,
            path: "/cgi-bin/user/info?lang=zh_CN&openid="+openid+"&access_token="+access_token,
            method: 'GET'
        };

        //console.log("请求用户信息：",options)
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