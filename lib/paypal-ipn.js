var https = require('https');
var qs = require('querystring');

var SANDBOX_URL = 'www.sandbox.paypal.com';
var REGULAR_URL = 'www.paypal.com';


exports.verify = function verify(params, callback) {
  if (typeof params === "undefined") {
    return callback(true, 'No params were passed to ipn.verify');
  }

  var body = 'cmd=_notify-validate&' + qs.stringify(params);

  //Set up the request to paypal
  var req_options = {
    host: (params.test_ipn) ? SANDBOX_URL : REGULAR_URL,
    method: 'POST',
    path: '/cgi-bin/webscr',
    headers: {'Content-Length': body.length}
  }


  var req = https.request(req_options, function paypal_request(res) {
    var data = [];

    res.on('data', function paypal_response(d) {
      data.push(d);
    });

    res.on('end', function response_end() {
      var response = data.join('');

      //Check if IPN is valid
      callback(response != 'VERIFIED', response);
    });
  });

  //Add the post parameters to the request body
  req.write(body);

  req.end();

  //Request error
  req.on('error', function request_error(e) {
    callback(true, e);
  });
};
