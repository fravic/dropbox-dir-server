var rest = require('./rest'),
    qs = require('qs');

var API_HOST = "api.dropbox.com";
var AUTH_URL = "https://www.dropbox.com/1/oauth2/authorize";
var JSON_BASE_OPTIONS = {
    https: true,
    host: API_HOST,
    headers: {'Content-Type': 'application/json'}
};

exports.authorizeViaCode = function(clientId, clientSecret, callback) {
    var authPath, params = {};
    params.client_id = clientId;
    params.response_type = "code";
    authPath = AUTH_URL + "?" + qs.stringify(params);
    console.log("Please authorize here: " + authPath);

    function onReceivedCode(code) {
        var options = JSON_BASE_OPTIONS, params;

        options.path = "/1/oauth2/token";
        options.method = "POST";
        params = {
            code: code,
            grant_type: "authorization_code",
            client_id: clientId,
            client_secret: clientSecret
        };
        options.path += "?" + qs.stringify(params);

        rest.getJSON(options, function(statusCode, result) {
            if (statusCode == 200) {
                console.log("Authenticated successfully!");
                callback(result.access_token);
            } else {
                console.error("Error authenticating:", result);
                callback(null);
            }
        });
    }

    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdout.write("Enter your access code: ");
    process.stdin.on('data', function (chunk) {
        onReceivedCode(chunk.slice(0,-1));
    });
}

exports.files = function(path, params, accessToken, callback) {
    var options = JSON_BASE_OPTIONS, apiPath;

    apiPath = "/1/files/dropbox/" + path + "?" + qs.stringify(params);
    options.access_token = accessToken;
    options.path = apiPath;
    options.method = 'GET';

    rest.getJSON(options, function(statusCode, result) {
        if (statusCode == 200) {
            callback(result);
        } else {
            console.error("Dropbox error getting file: (" + statusCode + ") " + result);
            callback(null);
        }

    });
};

exports.metadata = function(path, params, accessToken, callback) {
    var options = JSON_BASE_OPTIONS, apiPath;

    apiPath = "/1/media/dropbox/" + path + "?" + qs.stringify(params);
    options.access_token = accessToken;
    options.path = apiPath;
    options.method = 'GET';

    rest.getJSON(options, function(statusCode, result) {
        if (statusCode == 200) {
            callback(result);
        } else {
            console.error("Dropbox error getting metadata: (" + statusCode + ") " + result);
            callback(null);
        }
    });
};

exports.media = function(path, params, accessToken, callback) {
    var options = JSON_BASE_OPTIONS, apiPath;

    apiPath = "/1/metadata/dropbox/" + path + "?" + qs.stringify(params);
    options.access_token = accessToken;
    options.path = apiPath;
    options.method = 'POST';

    rest.getJSON(options, function(statusCode, result) {
        if (statusCode == 200) {
            callback(result);
        } else {
            console.error("Dropbox error getting media URL: (" + statusCode + ") " + result);
            callback(null);
        }
    });
};
