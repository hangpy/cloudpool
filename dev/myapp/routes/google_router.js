var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
var formidable = require('formidable');
var fs = require('fs');
var google_util = require('../app_modules/cpgoogle/google_util.js'); //수정

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

// 동시삭제, 동시다운로드 불가 다운로드 및 삭제 방식 변경 필요

router.post('/download', function(req, res) {
  var backURL = req.header('Referer') || '/';
  var FileID = req.body.name;
  console.log('fileid : ', FileID);
  google_util.download(FileID);
  res.redirect(backURL);
});

router.post('/upload/:id',function(req,res){
  var FolderID = req.params.id;
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {

    var FileInfo = files.userfile;
    //시각적으로 비동기 필요

    //비동기 필요
    google_util.upload(FileInfo, FolderID);

    res.redirect('/google/' + FolderID);
  });
});

// 동시삭제, 동시다운로드 불가 다운로드 및 삭제 방식 변경 필요 
router.post('/makedir/:id',function(req,res){
  var foldername;
  var FolderID;
  google_util.makedir(foldername,FolderID);

});

router.post('/getthumbnail/:id',function(req,res){

  var fileId;
  google_util.getthumbnailLink(fileId);
});

router.post('/copy/:id',function(req,res){
  var FileID;
  google_util.copy(FileID);

});

router.post('/searchtype',function(req,res){
  console.log(req.body.type);
  var Filetype=req.body.type;

  google_util.searchtype(Filetype, function(filelist) { //callback 함수를 통해 정보를 받아온다.
    console.log("return - 4");
    res.render('google_list',{
      FolderID : 'root',
      filelist : filelist
    });
    // $( "#objectID" ).load( "test.php", { "choices[]": [ "Jon", "Susan" ] } );
    // $('.graph').load("../../views/google_list.ejs");
  });
});

router.post('/searchname/:id',function(req,res){
  var Filename;
  google_util.updatefile(Filename);

});

router.post('/updatefile/:id',function(req,res){
  var Newname = req.body.filename;
  var fileId = req.body.name;
  
  console.log(req.params, req.body);
  google_util.updatefile(Newname,fileId);
});

router.post('/updatedir/:id',function(req,res){
  var fileId ;
  var folderId ;
  google_util.updatedir(fileId,folderId);
});

router.post('/download',function(req,res){
  var FileID = req.body.name;
  console.log('fileid : ',FileID);
  google_util.download(res,FileID);
});

router.post('/delete', function(req, res) {
  var backURL = req.header('Referer') || '/';
  var FileID = req.body.name;
  google_util.delete(FileID);
  res.redirect(backURL);
});


router.get('/folder/', (req, res) => {

  ID = '\'root\'';

  google_util.list(ID, function(filelist) { //callback 함수를 통해 정보를 받아온다.
    console.log("return - 2");
    res.render('google_list', {
      FolderID: ID,
      filelist: filelist
    });
  });

});


// 테스트, 지울거
router.get('/test/', function(req, res, next) {
  res.redirect('/intro');
})

router.get('/folder/:id', (req, res) => {

  var folderID;
  console.log(req.params);
  if (req.params.id == '\'root\'') folderID = req.params.id;
  else {
    folderID = '\'' + req.params.id + '\'';
  }
  google_util.list(folderID, function(filelist) {
    console.log("return - 3");
    console.log(filelist);
    res.render('google_list', {
      FolderID: req.params.id,
      filelist: filelist
    });
  })
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
