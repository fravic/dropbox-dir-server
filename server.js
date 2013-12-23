var express = require('express'),
    dropbox = require('./lib/dropbox');

var USER_DATA_FILENAME = ".user_data";
var app, port, dropboxAccessToken, basePath;

app = express();
app.use(express.logger());

app.get('/', function(req, res) {
    var userData, list = [], itemsOutstanding;

    function onReceivedUserData(data) {
        var params;

        userData = data || {};
        params = {list: true};
        dropbox.metadata(basePath, params, dropboxAccessToken, onReceivedFileList);
    }

    function onReceivedFileList(data) {
        if (data != null) {
            if (data["contents"]) {
                itemsOutstanding = 0;
                data["contents"].forEach(function(file) {
                    var itemPath;
                    if (!file["is_dir"]) {
                        itemsOutstanding++;
                        itemPath = file["path"];
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
            list.push(item);
        } else {
            console.warn("Warning: Invalid item path " + itemPath);
        }

        if (itemsOutstanding == 0) {
            res.status(200).send(list);
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

    if (!dropboxAccessToken) {
        dropbox.authorizeViaCode(process.env.DROPBOX_CLIENT_ID, process.env.DROPBOX_CLIENT_SECRET, function(token) {
            dropboxAccessToken = token;
            if (token == null) {
                process.exit(0);
            }
        });
    }
});
