var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
var formidable = require('formidable');
var fs = require('fs');
var google_util = require('../app_modules/cpgoogle/google_util.js'); //수정
var google_init = require('../app_modules/cpgoogle/google_init');

/* modules for getting user access token 지우지마!*/
const knex = require('../app_modules/db/knex');
const {
  google
} = require('googleapis');

const OAuth2 = google.auth.OAuth2;
const google_client = require('../app_modules/config/client_info').GOOGLE;
const oauth2Client = new OAuth2(
  google_client.getClientId(),
  google_client.getClientSecret(),
  google_client.getRedirectUrl()
);

router.use(bodyParser.urlencoded({
  extended: false
}));


router.get('/folder/', (req, res) => {
  google_init(req.user, function(client) {
    var folderID = 'root';
    var orderkey = 'folder'; // check
    google_util.list(folderID,orderkey,client, function(filelist) { //callback 함수를 통해 정보를 받아온다.
      console.log("return - 2");
      res.render('google_list', {
        FolderID: folderID,
        filelist: filelist
      });
    });
  });
});

router.get('/folder/:id', (req, res) => {
  google_init(req.user, function(client) {
    var folderID;
    if (req.params.id == '\'root\'') folderID = req.params.id;
    else {folderID = req.params.id ;}
    var orderkey = 'folder'; // check

    google_util.list(folderID,orderkey,client, function(filelist) { //callback 함수를 통해 정보를 받아온다.
      console.log("return - 3");
      res.render('google_list', {
        FolderID: folderID,
        filelist: filelist
      });
    });
  });
});

router.post('/upload/:id',function(req,res){
  google_init(req.user, function(client) {
    var folderID = req.params.id;
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
      var FileInfo = files.userfile;
      google_util.uploadFile(FileInfo, folderID,client);
      res.redirect('/google/' + folderID);
    });
  });
});

// 동시삭제, 동시다운로드 불가 다운로드 및 삭제 방식 변경 필요

router.post('/download', function(req, res) {
  google_init(req.user, function(client) {
    var backURL = req.header('Referer') || '/';
    var fileId = req.body.name;
    google_util.downloadFile(res,fileId,client);
    res.redirect(backURL);
  });
});

router.post('/delete', function(req, res) {

  google_init(req.user, function(client) {
    var backURL = req.header('Referer') || '/';
    var fileId = req.body.name;
    google_util.deleteFile(fileId,client);
    res.redirect(backURL);
  });
});

router.post('/rename',function(req,res){
  google_init(req.user, function(client) {
    var Newname = req.body.filename;
    var fileId = req.body.name;
    console.log(req.params, req.body);
    google_util.updateFile(Newname,fileId,client);
  });
});

router.post('/changedir/:id',function(req,res){
  google_init(req.user, function(client) {
    var fileId ;
    var folderId ;
    google_util.updateDir(fileId,folderId,client);
  });
});


router.post('/makedir/:id',function(req,res){
  google_init(req.user, function(client) {
    var foldername;
    var FolderID;
    google_util.makeDir(foldername,FolderID,client);
  });
});

router.post('/getthumbnail/:id',function(req,res){
  google_init(req.user, function(client) {
    var fileId;
    google_util.getThumbnailLink(fileId,client);
  });
});

router.post('/copy/:id',function(req,res){
  google_init(req.user, function(client) {
    var fileId;
    google_util.copyFile(fileId,client);
  });
});

router.post('/searchtype',function(req,res){
  google_init(req.user, function(client) {
    var Filetype=req.body.type;
    google_util.searchType(Filetype,client, function(filelist) { //callback 함수를 통해 정보를 받아온다.
      console.log("return - 4");
      res.render('google_list',{
        FolderID : 'root',
        filelist : filelist
      });
      // $( "#objectID" ).load( "test.php", { "choices[]": [ "Jon", "Susan" ] } );
      // $('.graph').load("../../views/google_list.ejs");
    });
  });
});

router.post('/searchname/:id',function(req,res){
  google_init(req.user, function(client) {
    var Filename;
    google_util.searchName(Filename,client);
  });
});

/* insert user access token into database */
router.get('/callback', function(req, res) {
  console.log("enter the /google/callback and userID is " + req.user.userID);
  var code = req.query.code;
  oauth2Client.getToken(code, function(error, tokens) {
    if (error) {
      res.send(error)
    };

    var accessToken = tokens.access_token;
    var refreshToken = tokens.refresh_token;

    console.log(accessToken);

    knex('GOOGLE_CONNECT_TB').insert({
      // todo: session에서 userID 추출
      userID: req.user.userID,
      accessToken_g: accessToken,
      refreshToken_g: refreshToken
    }).then(function() {
      res.redirect('/');
    }).catch(function(err) {
      console.log(err);
      res.status(500);
    });
  });
});


router.get('/refresh', function(req, res) {

  knex.select('accessToken_g', 'refreshToken_g')
  .from('GOOGLE_CONNECT_TB')
  .where('userID', req.user.userID)
  .then(function(rows){
    oauth2Client.credentials = {
      access_token: rows[0].accessToken_g,
      refresh_token: rows[0].refreshToken_g
    };
    oauth2Client.refreshAccessToken(function(err, tokens){
      if(err){
        console.log(err);
        res.send({
          msg: "Access token refresh is failed",
          state: 0,
          err: err
        });
      } else {
        var new_accessToken_g = tokens.access_token;
        knex('GOOGLE_CONNECT_TB').where('userID', req.user.userID)
        .update({
          accessToken_g: new_accessToken_g
        })
        .then(function(){
          res.send({
            msg: "Access token is refreshed successfully",
            state: 1
          });
        })
        .catch(function(err){
          console.log(err);
          res.send({
            msg: "Failed refresh token, check database",
            state: 0,
            err: err
          });
        });
      }
    })
  })
  .catch(function(err){
    console.log(err);
    res.redirect('/');
  });

});

module.exports = router;
