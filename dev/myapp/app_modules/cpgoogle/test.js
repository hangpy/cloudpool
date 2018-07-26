"use strict";

/**
* @file google_init
* @author hangbok
*
* @description This module is for simplifying process of getting google auth
* @param {object, callback}
* return value invovles google user's access and refresh token attributes within
* oauth2Client.credentials
*/
console.time('alpha');
const {google} = require('googleapis');
const client_info = require('../config/client_info');
var async=require('async');
var request=require('request');

  // Select google client info part out of several drives
  const google_client = client_info.GOOGLE;
  var OAuth2 = google.auth.OAuth2;

  var CLIENT_ID = google_client.getClientId(),
      CLIENT_SECRET = google_client.getClientSecret(),
      REDIRECT_URL = google_client.getRedirectUrl();
 
  function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
      if ((new Date().getTime() - start) > milliseconds){
        console.log('=============================Sleep! at the===================');
        break;
      }
    }
  }
  var oauth2Client = new OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URL
  );

  oauth2Client.credentials = {
    access_token: 'ya29.Glz8BRzz4uq8wzY3xiLwTzZ5MUJq4NKzUYC3i_3O4qp5WstAnZogj-fAFpx6H6lX-CGsd0e9m12FX6An5J9ydDsj0ESFYFWngJ8QtjMkEfy9eXxGvXtJ-aYBt778yg'
    ,refresh_token: '1/QZnltKi5QGjNVKUltA7W4t0_yvzTmsisN0D1bOV30hI'};

  var fileId = '1wi6vB5fWXer4T2ULA_0bNNGsl2Ff675g';
  var folderId = '0AGCP8EhCswtnUk9PVA';

  var drive = google.drive({version : 'v3', auth: oauth2Client });
  var ll=[];
  var pageToken = null;
// Using the NPM module 'async'

  var recurApi=function(folderId,Fdepth){//,CallBack){
    var FileList=[];
    var filelist =[];
    var query = "parents in '"+folderId+"' and trashed =false";

    async.doWhilst(function (callback1) {
      drive.files.list({
        q: query,
        fields: "nextPageToken, files(id,name,mimeType,createdTime,modifiedTime,size,parents)",
        pageSize: 1000,
        spaces: 'drive',
        pageToken: pageToken
      }, function (err, res) {
        if (err) {
          console.log('async.doWhilst err : ',err);
          callback(err)
        } 
        else {
          async.map(res.data.files, function(file, callback2){
            var fileinfo = {
              'id' : file.id,
              'name' : file.name,
              'mimeType' : file.mimeType,
              'modifiedTime' : file.modifiedTime,
              'size' : file.size,
              'parents' : folderId,
              'depth' : Fdepth
            };
            filelist.push(fileinfo);
          }, function(err, result){
            if(err) console.log(err);
            else {
              console.log('Finish the File list:'+folderId);
              callback(filelist);
            }
          });

            filelist=filelist.concat(res.data.files);
            pageToken = res.data.nextPageToken;
            callback();
        }
      });
      }, function () {
      return !!pageToken;
    }, function (err) {
      if (err) {
        console.log('async.doWhilst Final err : ',err);
      }
      else{
        console.log(filelist);
      }
    });
  }

// console.time('alpha');
recurApi('root',1);

// { id: '1gd2kkvnSjz95WUM9KWePmhDc_BrAdlqq',
// name: 'dir1',
// mimeType: 'application/vnd.google-apps.folder',
// parents: [ '0AGCP8EhCswtnUk9PVA' ],
// createdTime: '2018-05-03T06:49:40.133Z',
// modifiedTime: '2018-05-03T06:49:40.133Z' },

  // drive.files.list({
  //   q: "parents in 'root' and trashed = false",
  //   fields: "nextPageToken, files(id,name,mimeType,createdTime,modifiedTime,size,parents)",
  //   pageSize: 1000,
  //   spaces: 'drive',
  //   pageToken: pageToken
  // }, function (err, res) {
  //   if (err) {
  //     // Handle error
  //     console.log('first api call error : ',err);
  //     callback(err)
  //   } 
  //   else {
  //     console.log(res.data.files[0].parents[0]);
  //     callback();
  //   }
  // });
  
 

