var formidable = require('formidable');
var router = require('express').Router();
var fs = require('fs');
var box_util = require('../app_modules/cpbox/box_util');
var async = require('async');
var box_init = require('../app_modules/cpbox/box_init');

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

router.get('/folder', (req, res) => {
  box_init(req.user, function(client){
    var folderID = 0;
    box_util.listFile(client, folderID, function(filelist) {
      console.log("return - 2");
      res.render('box_list', {
        FolderID: folderID,
        filelist: filelist
      });
    });
  });
});

router.get('/folder/:id', (req, res) => {
  box_init(req.user, function(client){
    // var folderID = '\''+req.params.id+'\'';
    var folderID = req.params.id;
    box_util.listFile(client, folderID, function(filelist) {
      console.log("return - 3");
      res.render('box_list', {
        FolderID: folderID,
        filelist: filelist
      });
    });
  });
});

router.post('/upload/:id', function(req, res) {
  box_init(req.user, function(client){
    var FolderID = req.params.id;
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {

      var FileInfo = files.userfile;

      res.redirect('/' + FolderID);

      //비동기 필요
      box_util.uploadFile(client, FileInfo, FolderID);
    });
  });
});

router.post('/download', function(req, res) {
  box_init(req.user, function(clinet){
    var backURL = req.header('Referer') || '/';
    console.log(req.body);
    var FileID = req.body.name;
    if (Array.isArray(FileID)) {
      async.map(FileID, function(id, callback) {
        box_util.downloadFile(id);
        callback(null, 'finish');
      });
    } else {
      box_util.downloadFile(clinet, FileID);
    }
    res.redirect(backURL);
  });
});

router.post('/delete', function(req, res) {
  box_init(req.user, function(client){
    var backURL = req.header('Referer') || '/';
    console.log(req.body);
    var FileID = req.body.name;
    if (Array.isArray(FileID)) {
      async.map(FileID, function(id, callback) {
        box_util.deleteFile(client, id);
        callback(null, 'finish');
      });
    } else {
      box_util.deleteFile(client, FileID);
    }
    res.redirect(backURL);
  });
});

router.post('/rename/file', function(req, res) {
  box_init(req.user, function(client){
    var FileID = '302277766633';
    var newname = 'newname.txt';
    box_util.renameFile(client, FileID, newname);
    res.redirect('/');
  });
});

router.post('/rename/folder', function(req, res) {
  box_init(req.user, function(client){
    var FolderID = '50984438480';
    var newname = 'newname';
    box_util.renameFolder(client, FolderID, newname);
    res.redirect('/');
  });
});

router.post('/move/file', function(req, res) {
  box_init(req.user, function(client){
    var FileID = '302277766633';
    var parentId = '50984438480';
    box_util.moveFile(client, FileID, parentId);
    res.redirect('/');
  });
});

router.post('/move/folder', function(req, res) {
  box_init(req.user, function(client){
    var FolderID = '49716412865';
    var parentId = '50984438480';
    box_util.moveFolder(client, FolderID, parentId);
    res.redirect('/');
  });
});

router.post('/thumbnail', function(req, res) {
  box_init(req.user, function(client){
    var FileID = '303256234543';
    box_util.thumbnail(client, FileID);
    res.redirect('/');
  });
});

router.post('/search', function(req, res) {
  box_init(req.user, function(client){
    var searchText = 'test';
    box_util.search(client, searchText, function(filelist) {
      console.log("return - 4");
      console.log(filelist);
      res.render('box_list', {
        FolderID: 0,
        filelist: filelist
      });
    });
  });
});

router.post('/listAllFiles', function(req, res) {
  box_init(req.user, function(client){
    var folderID = 0;
    box_util.listAllFiles(client, folderID, function(filelist) {
      console.log("return - 5");
      res.render('box_list', {
        FolderID: folderID,
        filelist: filelist
      });
    });
  });
});


/* get box authentication and insert into database */
router.get('/token', function(req, res) {

  var csrfToken = box_auth.generateCSRFToken();
  console.log('access /box/token');
  res.cookie('csrf', csrfToken);

  res.redirect(url.format({
    protocol: 'https',
    hostname: 'account.box.com',
    pathname: 'api/oauth2/authorize',
    query: {
      client_id: CLIENT_ID,
      response_type: 'code',
      state: csrfToken,
      // redirect_uri must be matched with one of enrolled redirect url in dropbox
      redirect_uri: box_auth.generateRedirectURI(req)
    }
  }));


});

router.get('/callback', function(req, res) {
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
  sdk.getTokensAuthorizationCodeGrant(code, null, function(error, tokens) {
    if (error) {
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

router.get('/refresh', function(req, res) {

  knex.select('refreshToken_b')
  .from('BOX_CONNECT_TB')
  .where('userID', req.user.userID)
  .then(function(rows){
    const USER_REFRESH_TOKEN = rows[0].refreshToken_b;
    sdk.getTokensRefreshGrant(USER_REFRESH_TOKEN, function(err, tokenInfo) {
      if(err){
        console.log(err);
        res.send({
          msg: "Access token refresh is failed",
          state: 0,
          err: err
        });
      } else {
        var new_accessToken_b = tokenInfo.accessToken;
        var new_refreshToken_b = tokenInfo.refreshToken;
        knex('BOX_CONNECT_TB').where('userID', req.user.userID)
        .update({
          accessToken_b: new_accessToken_b,
          refreshToken_b: new_refreshToken_b
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
