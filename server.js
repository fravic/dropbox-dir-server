var express = require('express'),
    dropbox = require('./lib/dropbox');

var USER_DATA_FILENAME = ".user_data";
var app, port, dropboxAccessToken, basePath;

app = express();
app.use(express.logger());

app.get('/', function(req, res) {
    var params, userData, list = [], itemsOutstanding;

    params = {list: true};

    function onReceivedUserData(data) {
        if (data != null) {
            userData = data;
            dropbox.metadata("dropbox", basePath, params, dropboxAccessToken, onReceivedFileList);
        } else {
            res.send(500);
        }
    }

    function onReceivedFileList(data) {
        if (data != null) {
            if (data["contents"]) {
                itemsOutstanding = data["contents"].length;
                data["contents"].forEach(function(file) {
                    var itemPath;
                    if (!data["contents"]["is_dir"]) {
                        itemPath = data["contents"]["path"];
                        dropbox.media(itemPath, {}, dropboxAccessToken, function(data) {
                            onReceivedMediaURL(itemPath, data);
                        });
                    }
                });
            } else {
                console.error("Dropbox path provided is not a directory.");
                res.send(500);
            }
        }
    }

    function onReceivedMediaURL(itemPath, data) {
        itemsOutstanding -= 1;

        if (data != null) {
            var item = {};
            if (userData && userData[itemPath]) {
                item["userData"] = userData;
            }
            item["url"] = data["url"];
            list += item;
        } else {
            console.warn("Warning: Invalid item path " + itemPath);
        }

        if (itemsOutstanding == 0) {
            res.status(200).send(items);
        }
    }

    dropbox.files(basePath + "/" + USER_DATA_FILENAME, {}, dropboxAccessToken, onReceivedUserData);
});

app.get('/data', function(req, res) {
});

port = process.env.PORT || 8080;
app.listen(port, function() {
    basePath = process.argv[2];
    if (!basePath) {
        console.error("Must supply Dropbox path to serve!");
        process.exit(0);
    }

    console.log("Listening on " + port + " for " + basePath);
    dropbox.authorizeViaCode(process.env.DROPBOX_CLIENT_ID, process.env.DROPBOX_CLIENT_SECRET, function(token) {
        dropboxAccessToken = token;
        if (token == null) {
            process.exit(0);
        }
    });
});
