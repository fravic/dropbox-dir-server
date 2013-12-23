var http = require("http");
var https = require("https");

/**
 * getJSON: REST request returning JSON object(s)
 * @param options: http options object
 * @param callback: callback to pass the results JSON object(s) back
 */
exports.getJSON = function(options, onResult) {
    var prot, req;
    prot = options.https ? https : http;
    req = prot.request(options);

    options.headers = options.headers || {};
    if (options.body) {
        req.write(options.body);
    }

    req.on('response', function(res) {
        var output = '';
        console.log(options.host + options.path + ':' + res.statusCode);
        res.setEncoding('utf8');

        res.on('data', function (chunk) {
            output += chunk;
        });

        res.on('end', function() {
            var obj;
            try {
                obj = JSON.parse(output);
            } catch (e) {
                obj = e.toString();
            } finally {
                onResult(res.statusCode, obj);
            }
        });
    });

    req.on('error', function(err) {
        //res.send('error: ' + err.message);
    });

    req.end();
};
