// Generated by CoffeeScript 1.6.3
(function() {
    var http, querystring;

    http = require('http');

    querystring = require('querystring');

    exports.request = function(url, post_data, cb) {
        var options, req;
        post_data = querystring.stringify(post_data);
        options = {
            host: '127.0.0.1',
            port: 8080,
            path: "/lavico.middleware/L/"+url + '?' + post_data,
            method: 'GET'
        };
        console.log("http://"+options.host+":"+options.port+options.path);
        req = http.request(options, function(res) {
            res.setEncoding('utf8');
            var body='';
            res.on('data', function(data) {
                body +=data;
            });
            res.on('end',function(){
                //console.log("中间件返回",body)
                return cb(null,body);
            })
            return req.on('error', function(e) {
                return cb(e);
            });
        });
        req.write(post_data);
        return req.end();
    };

}).call(this);
