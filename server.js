var express = require('express'),
    dropbox = require('./lib/dropbox'),
    qs = require('qs');

var USER_DATA_FILENAME = ".user_data";

var app, port, dropboxAccessToken;

app = express();
app.use(express.logger());
app.use(express.bodyParser());

app.get('/', function(req, res) {
    var userData, list = [], itemsOutstanding;

    function onReceivedUserData(data) {
        var params = {list: true};
        userData = data || {};
        dropbox.metadata("", params, dropboxAccessToken, onReceivedFileList);
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
                item["userData"] = userData[itemPath];
            }
            item["url"] = data["url"];
            item["path"] = itemPath;
            list.push(item);
        } else {
            console.warn("Warning: Invalid item path " + itemPath);
        }

        if (itemsOutstanding == 0) {
            res.status(200).send(list);
        }
    }

    dropbox.files(USER_DATA_FILENAME, {}, dropboxAccessToken, onReceivedUserData);
});

app.post('/data', function(req, res) {
    var postData = qs.parse(req.body);

    function onReceivedPutFiles() {
        res.send(200);
    }

    dropbox.files_put(USER_DATA_FILENAME, postData.data, {}, dropboxAccessToken, onReceivedPutFiles);
});

port = process.env.PORT || 8080;
app.listen(port, function() {
    console.log("Listening on " + port);

    if (!dropboxAccessToken) {
        dropbox.authorizeViaCode(process.env.DROPBOX_CLIENT_ID, process.env.DROPBOX_CLIENT_SECRET, function(data) {
            dropboxAccessToken = data.access_token;
            if (dropboxAccessToken == null) {
                process.exit(0);
            }
        });
    }
});
