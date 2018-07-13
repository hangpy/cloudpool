var path = require('path')
, {google} = require('googleapis')
, async = require('async')
, fs = require('fs')
, initGoogle = require('./google_init')
, https = require('https')
, request  = require('request');

var usr_session = null;
initGoogle(usr_session, function(oauth2Client){
  var fileId = '1wi6vB5fWXer4T2ULA_0bNNGsl2Ff675g';
  var folderId = '0AGCP8EhCswtnUk9PVA';

  var drive = google.drive({version : 'v3', auth: oauth2Client });
  // var query = "parents in "" and trashed = false ";
  Filename='dir';
  var query = "name contains '"+Filename+"' and trashed = false ";
  
  // var query = "name contains 'dir' and trashed = false ";
  console.log(query);
  drive.files.list({
    q: query,
    auth: oauth2Client,
    pageSize: 100,
    fields: "nextPageToken, files(id,name,mimeType,createdTime,modifiedTime,size,parents)"
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error 1: ' + err);
      return;
    }
    else{
      console.log(response.data.files);
    }
  });
});