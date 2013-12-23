var rest = require('./rest');

var API_HOST = "api.dropbox.com";
var JSON_BASE_OPTIONS = {
    https: true,
    host: API_HOST,
    headers: {'Content-Type': 'application/json'}
};

function paramsToString(params) {
    var str = "?", k;
    for (k in params) {
        str += k + "=" + params[k] + "&";
    }
    return str;
}

exports.files = function(path, params, callback) {
    var options = JSON_BASE_OPTIONS, apiPath;

    apiPath = "/1/media/dropbox/" + path + paramsToString(params);
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

exports.metadata = function(path, params, callback) {
    var options = JSON_BASE_OPTIONS, apiPath;

    apiPath = "/1/media/dropbox/" + path + paramsToString(params);
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
}

exports.media = function(path, params, callback) {
    var options = JSON_BASE_OPTIONS, apiPath;

    apiPath = "/1/metadata/dropbox/" + path + paramsToString(params);
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
}
