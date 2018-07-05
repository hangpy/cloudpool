var path = require('path')
, {google} = require('googleapis')
, async = require('async')
, fs = require('fs')
, initGoogle = require('./google_init')
, https = require('https')
, request  = require('request');

function download(fileId,oauth2Client) {
  var drive = google.drive({version : 'v3', auth: oauth2Client });

  drive.files.get({
    fileId: fileId,
    alt: "media"
  }, (err) => {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
  }).pipe(res);;
}

var usr_session = null;
initGoogle(usr_session, function(oauth2Client){
  var fileId = '1gd2kkvnSjz95WUM9KWePmhDc_BrAdlqq';
  download(fileId,oauth2Client);
});
