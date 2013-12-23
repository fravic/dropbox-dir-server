var rest = require('./rest'),
    qs = require('qs');

var API_HOST = "api.dropbox.com";
var API_CONTENT_HOST = "api-content.dropbox.com";
var AUTH_URL = "https://www.dropbox.com/1/oauth2/authorize";
var JSON_BASE_OPTIONS = {
    https: true,
    host: API_HOST,
    headers: {'Content-Type': 'application/json'}
};
var JSON_CONTENT_OPTIONS = {
    https: true,
    host: API_CONTENT_HOST,
    headers: {'Content-Type': 'application/json'}  };
var ACCESS_TYPE = "sandbox";

function getJSONAndCallback(options, callback, errorMsg) {
    rest.getJSON(options, function(statusCode, result) {
        if (statusCode == 200) {
            callback(result);
        } else {
            console.error(errorMsg + ":", "(" + statusCode + ")", result);
            callback(null);
        }
    });
}

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

        getJSONAndCallback(options, callback, "Error authenticating");
    }

    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdout.write("Enter your access code: ");
    process.stdin.on('data', function (chunk) {
        onReceivedCode(chunk.slice(0,-1));
    });
}

exports.files = function(path, params, accessToken, callback) {
    var options = JSON_CONTENT_OPTIONS, apiPath;
    params.access_token = accessToken;

    apiPath = "/1/files/" + ACCESS_TYPE + "/" + path + "?" + qs.stringify(params);
    options.path = apiPath;
    options.method = 'GET';

    getJSONAndCallback(options, callback, "Dropbox error getting file");
};

exports.files_put = function(path, data, params, accessToken, callback) {
    var options = JSON_CONTENT_OPTIONS, apiPath;
    params.access_token = accessToken;

    apiPath = "/1/files_put/" + ACCESS_TYPE + "/" + path + "?" + qs.stringify(params);
    options.path = apiPath;
    options.method = 'PUT';
    options.body = data;

    getJSONAndCallback(options, callback, "Error putting file");
};

exports.metadata = function(path, params, accessToken, callback) {
    var options = JSON_BASE_OPTIONS, apiPath;
    params.access_token = accessToken;

    apiPath = "/1/metadata/" + ACCESS_TYPE + "/" + path + "?" + qs.stringify(params);
    options.path = apiPath;
    options.method = 'GET';

    getJSONAndCallback(options, callback, "Dropbox error geting metadata");
};

exports.media = function(path, params, accessToken, callback) {
    var options = JSON_BASE_OPTIONS, apiPath;
    params.access_token = accessToken;

    apiPath = "/1/media/" + ACCESS_TYPE + "/" + path + "?" + qs.stringify(params);
    options.path = apiPath;
    options.method = 'POST';

    getJSONAndCallback(options, callback, "Dropbox error geting media URL");
};
