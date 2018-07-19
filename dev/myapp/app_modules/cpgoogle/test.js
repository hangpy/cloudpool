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

  var CLIENT_ID = '714692765966-s4j4lg93biif9dthfesu8u4udtet85dt.apps.googleusercontent.com',
      CLIENT_SECRET = 'yy32K0r5Y0h6JUfcyHWq4RtE',
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
    access_token: 'ya29.Glz8BSyrztxGnEPDq3BKPGWPysA7jT6OZJ7FK-Y5mXGDdIS-ctlSR_8VbT7MlkMGJBI0W74seVABeDz0ccd2W7N3MC0n4T7yYpwKChR1OdGKrrg9TAwwPPfxd2mE4Q'
    ,refresh_token: '1/QZnltKi5QGjNVKUltA7W4t0_yvzTmsisN0D1bOV30hI'};

  var fileId = '1wi6vB5fWXer4T2ULA_0bNNGsl2Ff675g';
  var folderId = '0AGCP8EhCswtnUk9PVA';

  var drive = google.drive({version : 'v3', auth: oauth2Client });
  var ll=[];
  var pageToken = null;
// Using the NPM module 'async'


// var data = {
//   q: "mimeType='application/vnd.google-apps.folder'",
//   fields: "nextPageToken, files(id,name,mimeType,createdTime,modifiedTime,size,parents)",
//   pageSize: 400,
//   // spaces: 'drive',
//   pageToken: pageToken
// };
// request.post({
//   url: 'http://localhost:4000/api/google/check/',
//   body : data,
//   json : true
// },
//   function(error, response, body){
//      console.log());
//   }
// );



  // async.doWhilst(function (callback) {
  //   drive.files.list({
  //     q: "name contains '남미' and trashed = false",
  //     fields: "nextPageToken, files(kind,id,name,mimeType,createdTime,modifiedTime,size,parents,owners,viewedByMeTime)",
  //     pageSize: 100,
  //     spaces: 'drive',
  //     pageToken: pageToken
  //   }, function (err, res) {
  //     if (err) {
  //       // Handle error
  //       console.error(err);
  //       callback(err)
  //     } else {

  //       ll=ll.concat(res.data.files);
  //       console.log(ll[0]);
  //       pageToken = res.data.nextPageToken;
  //       callback();
  //     }
  //   });
  // }, function () {
  //   return !!pageToken;
  // }, function (err) {
  //   if (err) {
  //     // Handle error
  //     console.error(err);
  //   } else {
  //     console.log('finished');
  //     console.timeEnd('alpha');

  //     // All pages fetched
  //   }
  // });
  var i=0;
  var error=0;
  var recurApi=function(folderId,CallBack){
    var FileList=[];
    var filelist =[];
    var query = "parents in '"+folderId+"' and trashed =false";

    async.doWhilst(function (callback) {
      drive.files.list({
        q: query,
        fields: "nextPageToken, files(id,name,mimeType,createdTime,modifiedTime,size,parents)",
        pageSize: 1000,
        spaces: 'drive',
        pageToken: pageToken
      }, function (err, res) {
        if (err) {
          // Handle error
          error=error+1;
          console.log('==============================================================================error list:',i);

          callback(err)
        }
        else {
          i=i+1;
          if(i<300){
            // console.log('============================Sleep 1! at the' + i)
            sleep(200);
            // console.log('============================Sleep 1! finish at the' + i)
            console.log('query:',i);
            filelist=filelist.concat(res.data.files);
            // console.log(filelist.length);
            pageToken = res.data.nextPageToken;
            callback();
          }
          else{
            console.log('query:',i);
            filelist=filelist.concat(res.data.files);
            // console.log(filelist.length);
            pageToken = res.data.nextPageToken;
            callback();
          }
        }
      });
    }, function () {
      return !!pageToken;
    }, function (err) {
      if (err) {
        error=error+1;
        console.log('================================================================================error ========second list:',i);

      }
      else{
        console.log('1st depth file length:',filelist.length);
        async.map(filelist,function(file,callback2){
          i=i+1;

          console.log('query:',i);
          if(i<600){
              // console.log('============================Sleep 2! at the' + i)
              sleep(200);
              // console.log('============================Sleep 2! finish at the' + i)
              FileList.push(file);
              if(file.mimeType=='application/vnd.google-apps.folder'){
                // console.log('file is folder!');
                recurApi(file.id,function(filesInfolder){
                  FileList=FileList.concat(filesInfolder);
                  callback2(null,'finished');
                })
              }
            else{
              callback2(null,'finished');
            }
          }
          else{
            FileList.push(file);
            if(file.mimeType=='application/vnd.google-apps.folder'){
              // console.log('file is folder!');
              recurApi(file.id,function(filesInfolder){
                FileList=FileList.concat(filesInfolder);
                callback2(null,'finished');
              })
            }
            else{
              callback2(null,'finished');
            }
          }

        },function(err,result){
          if(err){
            error=error+1;
            console.log('====================================================================================error list:',i);

          }



            CallBack(FileList);

        });
      }
    });
  }

console.time('alpha');
recurApi('root',function(FileList){
  console.log('final list length :',FileList.length);
  console.timeEnd('alpha');
  console.log(error);
})


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
