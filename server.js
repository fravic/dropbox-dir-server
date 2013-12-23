var express = require('express');
var dropbox = require('./lib/dropbox');

var app = express();
app.use(express.logger());

app.get('/', function(req, res) {
    var path, params;
    path = process.argv[1];
    if (!path) {
        console.error("Must supply Dropbox path to serve!");
    }
    params = {list: true};

    // List files in path
    dropbox.metadata("dropbox", path, params, function(data) {
        if (data != null) {
            if (data["contents"]) {
                data["contents"].forEach(function(file) {
                    if (!data["contents"]["is_dir"]) {
                        // Append user data to return data
                        // Append media url to return data
                    }
                });
            } else {
                console.error("Dropbox path provided is not a directory.");
            }
        }
    });
});

app.get('/data', function(req, res) {
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
    console.log("Listening on " + port);
});
