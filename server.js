var express = require('express');
var dropbox = require('./lib/dropbox');

var USER_DATA_FILENAME = ".user_data";

var app = express();
app.use(express.logger());

app.get('/', function(req, res) {
    var path, params, userData, list = [], itemsOutstanding;

    path = process.argv[1];
    if (!path) {
        console.error("Must supply Dropbox path to serve!");
        res.send(500);
    }
    params = {list: true};

    function onReceivedUserData(data) {
        if (data != null) {
            userData = data;
            dropbox.metadata("dropbox", path, params, onReceivedFileList);
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
                        dropbox.media(itemPath, {}, function(data) {
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

    dropbox.files(path + USER_DATA_FILENAME, onReceivedUserData);
});

app.get('/data', function(req, res) {
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
    console.log("Listening on " + port);
});
