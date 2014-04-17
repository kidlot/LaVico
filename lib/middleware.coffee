http = require('http');
querystring = require('querystring');

exports.request = (url, post_data, cb)->

  post_data = querystring.stringify(post_data);

  options = {
    host: '127.0.0.1',
    port: 8078,
    path: url+'?'+post_data,
    method: 'GET'
  };

  req = http.request(options, (res)->

    res.setEncoding('utf8');
    res.on('data', (body) ->
      cb(null,body)
    )

    req.on('error', (e) ->
      cb(e)
    )
  )
  req.write(post_data);
  req.end();
