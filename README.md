Dropbox Directory Server
========================

Node/Express: Given a dropbox user and directory, lists public links for media items in the directory, and associated JSON data.

Invocation
----------
# node ./server.js --dir=$DROPBOX_DIR

This will provide a webpage for Dropbox authentication via OAuth 2.0.


Client Usage
------------

*GET /*
Lists metadata for media files in $DROPBOX_DIR, their associated public access URIs, and any associated JSON data.

*POST /data?path=$FILE_PATH&data=$JSON_OBJ*
Associates $JSON_OBJ to a file in $DROPBOX_DIR, to be returned with future file listings.
