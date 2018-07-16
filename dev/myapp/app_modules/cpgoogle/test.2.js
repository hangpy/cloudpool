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


  var fileMetadata = {
    'name': 'Invoices2',
    'mimeType': 'application/vnd.google-apps.folder',
    parents:['1gd2kkvnSjz95WUM9KWePmhDc_BrAdlqq']
    // 'parents' : '1gd2kkvnSjz95WUM9KWePmhDc_BrAdlqq'
  };
  drive.files.create({
    resource: fileMetadata,
    fields: 'id, parents'
  }, function (err, file) {
    if (err) {
      // Handle error
      console.error(err);
    } else {
      console.log('Folder Id: ', file.data);
    }
  });


      // var query = "parents in "" and trashed = false ";
      // var Filetype = 'application/vnd.google-apps.folder';
      // var query = "mimeType contains '"+Filetype+"' and trashed = false ";
      // drive.files.list({
      //   q: query,
      //   auth: oauth2Client,
      //   pageSize: 100,
      //   fields: "nextPageToken, files(id,name,mimeType,createdTime,modifiedTime,size,parents)"
      // }, function(err, response) {
      //   if (err) {
      //     console.log('The API returned an error 1: ' + err);
      //     return;
      //   }
      //   else{
      //     console.log(response.data.files);
      //   }
      // });
});