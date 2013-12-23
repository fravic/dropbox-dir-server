var rest = require('./rest');

var API_MEDIA_PATH = "https://api.dropbox.com/1/media/";
var API_METADATA_PATH = "https://api.dropbox.com/1/metadata/";

var JSON_BASE_OPTIONS = {
    https: true,
    headers: {'Content-Type': 'application/json'}
};

exports.metadata = function(root, path, params, callback) {
    var options = JSON_BASE_OPTIONS, path = "?", k;

    for (k in params) {
        path += k + "=" + params[k] + "&";
    }
    options.host = API_METADATA_PATH;
    options.path = path;
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

exports.media = function(callback) {
    var options = JSON_BASE_OPTIONS, path = "";
    options.host = API_MEDIA_PATH;
    options.path = path;
    options.method = 'POST';
    rest.getJSON(options, function(statusCode, result) {
    });
}
