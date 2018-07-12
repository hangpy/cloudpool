var formidable = require('formidable');
var router = require('express').Router();
var fs = require('fs');
var box_util=require('../app_modules/cpbox/box_util.js');
var async = require('async');

/* modules required to get athentication from box */
const BoxSDK = require('box-node-sdk');
const box_client = require('../app_modules/config/client_info').BOX;
const url = require('url');
const app = require('express')();
const box_auth = require('../app_modules/cpbox/box_auth')();
const knex = require('../app_modules/db/knex');

const CLIENT_ID = box_client.getClientId();
const CLIENT_SECRET = box_client.getClientSecret();

var sdk = new BoxSDK({
  clientID: CLIENT_ID,
  clientSecret: CLIENT_SECRET
});

router.post('/delete',function(req,res){
  var backURL = req.header('Referer') || '/';
  console.log(req.body);
  var FileID = req.body.name;
  if(Array.isArray(FileID)) {
    async.map(FileID, function(id, callback){
      box_util.delete(id);
      callback(null, 'finish');
    });
  }
  else {
    box_util.delete(FileID);
  }
  // res.redirect(backURL);
});

router.post('/download',function(req,res){
  var backURL = req.header('Referer') || '/';
  console.log(req.body);
  var FileID = req.body.name;
  if(Array.isArray(FileID)) {
    async.map(FileID, function(id, callback){
      box_util.download(id);
      callback(null, 'finish');
    });
  }
  else {
    box_util.download(FileID);
  }
  // res.redirect(backURL);
});

router.post('/upload/:id',function(req,res){
  var FolderID = req.params.id;
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {

    var FileInfo = files.userfile;

          // res.redirect('/');

    //비동기 필요
    box_util.upload(FileInfo,FolderID
    //   , function(message){
    //     console.log(message);
    //   res.redirect('/'+FolderID);}
    );

  });
});

router.get('/folder', (req,res)=>{
  // ID='\'root\'';
  ID='0';

  box_util.list(ID, function(filelist) { //callback 함수를 통해 정보를 받아온다.
    console.log("return - 2");
    res.render('box_list',{
      FolderID : ID,
      filelist:filelist
    });
  });

});


router.get('/folder/:id', (req,res)=>{
  // var folderID = '\''+req.params.id+'\'';
  var folderID = req.params.id;

  box_util.list(folderID, function(filelist){
    console.log("return - 3");

    res.render('box_list',{
        FolderID : folderID,
        filelist:filelist
    });
  })
});



// 이항복이 추가한부분 지우지 말것!
/* get box authentication and insert into database */
// router when general user use function enrolling authentication about dropbox
router.get('/token', function(req, res) {

  var csrfToken = box_auth.generateCSRFToken();
  console.log('access /box/token');
  res.cookie('csrf', csrfToken);

  // https://account.box.com/api/oauth2/authorize
  // ?response_type=code
  // &client_id=<MY_CLIENT_ID>
  // &redirect_uri=<MY_REDIRECT_URL>
  // &state=<MY_SECURITY_TOKEN>

  res.redirect(url.format({
    protocol: 'https',
    hostname: 'account.box.com',
    pathname: 'api/oauth2/authorize',
    query: {
      client_id: CLIENT_ID, //App key of dropbox api
      response_type: 'code',
      state: csrfToken,
      // redirect_uri must be matched with one of enrolled redirect url in dropbox
      redirect_uri: box_auth.generateRedirectURI(req)
    }
  }));


});

router.get('/callback', function(req, res){
  if (req.query.error) {
    return res.send('ERROR ' + req.query.error + ': ' + req.query.error_description);
  }
  if (req.query.state !== req.cookies.csrf) {
    return res.status(401).send(
      'CSRF token mismatch, possible cross-site request forgery attempt.'
    );
  }
  // query code will can be catched when user authorize box by login
  var code = req.query.code;
  sdk.getTokensAuthorizationCodeGrant(code, null, function(error, tokens){
    if(error){
      console.error(error);
    } else {
      const USER_ACCESS_TOKEN = tokens.accessToken;
      const USER_REFRESH_TOKEN = tokens.refreshToken;

      // insert token into database
      knex('BOX_CONNECT_TB').insert({
        userID: req.user.userID,
        accessToken_b: USER_ACCESS_TOKEN,
        refreshToken_b: USER_REFRESH_TOKEN
      }).then(function() {
        res.redirect("/");
      }).catch(function(err) {
        console.log(err);
        res.status(500);
      });
    }
  });
});

module.exports = router;
