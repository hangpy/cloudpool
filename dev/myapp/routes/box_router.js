const formidable = require('formidable');
const router = require('express').Router();
const fs = require('fs');
const box_util = require('../app_modules/cpbox/box_util');
const async = require('async');
const box_init = require('../app_modules/cpbox/box_init');
const moment = require('moment');
const schedule = require('node-schedule');
const passport = require('passport');
const redis_client = require('../app_modules/config/redis')

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
  box_init(req.user, function(client) {
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
  box_init(req.user, function(client) {
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
  box_init(req.user, function(client) {
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
  box_init(req.user, function(clinet) {
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
  box_init(req.user, function(client) {
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
  box_init(req.user, function(client) {
    var FileID = '302277766633';
    var newname = 'newname.txt';
    box_util.renameFile(client, FileID, newname);
    res.redirect('/');
  });
});

router.post('/rename/folder', function(req, res) {
  box_init(req.user, function(client) {
    var FolderID = '50984438480';
    var newname = 'newname';
    box_util.renameFolder(client, FolderID, newname);
    res.redirect('/');
  });
});

router.post('/move/file', function(req, res) {
  box_init(req.user, function(client) {
    var FileID = '302277766633';
    var parentId = '50984438480';
    box_util.moveFile(client, FileID, parentId);
    res.redirect('/');
  });
});

router.post('/move/folder', function(req, res) {
  box_init(req.user, function(client) {
    var FolderID = '49716412865';
    var parentId = '50984438480';
    box_util.moveFolder(client, FolderID, parentId);
    res.redirect('/');
  });
});

router.post('/thumbnail', function(req, res) {
  box_init(req.user, function(client) {
    var FileID = '303256234543';
    box_util.thumbnail(client, FileID);
    res.redirect('/');
  });
});

router.post('/search', function(req, res) {
  box_init(req.user, function(client) {
    var searchText = 'test';
    box_util.search(client, searchText, function(filelist) {
      console.log("return - 4");
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

router.get('/callback', function(req, res, next) {
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
/*
 knex.select('recentRefreshTime_b')
 .from('BOX_CONNECT_TB')
 .where('userID', req.user.userID)
 .then(function(rows){
   console.log(rows[0]);
   res.redirect('/box/refresh');

   var recentRefreshTime = rows[0];
   console.log(rows[0]);
   if(rows[0] == null){
     knex.select('registerTime_b')
     .from('BOX_CONNECT_TB')
     .where('userID', req.user.userID)
     .then(function(rows){
       var registerTime = rows[0];
       console.log("---------------[no recentRefreshTime, so registerTime]: " + registerTime)
     })
     .catch(function(err){
       console.log(err);
     });
   } else {
     console.log("----------------[recentRefreshTime]: " + recentRefreshTime);
   }

 })
 .catch(function(err){
   console.log(err);
 })
 */


router.get('/refresh', function(req, res) {

  knex.select('refreshToken_b')
    .from('BOX_CONNECT_TB')
    .where('userID', req.user.userID)
    .then(function(rows) {
      const USER_REFRESH_TOKEN = rows[0].refreshToken_b;
      sdk.getTokensRefreshGrant(USER_REFRESH_TOKEN, function(err, tokenInfo) {
        if (err) {
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
            .then(function() {
              res.send({
                msg: "Access token is refreshed successfully",
                state: 1
              });
            })
            .catch(function(err) {
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
    .catch(function(err) {
      console.log(err);
      res.redirect('/');
    });
});


router.get('/token/refresh', function(req, res, next){

  console.log('============ GET /box/token/refresh !! =============');

  /*                 min  sec  milli     */
  const EXPIRE_TIME = 1 * 10 * 1000;
  var userID = req.query.user_id;
  console.log("req.user.userID: " + userID);

  // 사용자가 박스를 등록을 했을 때 시행

  knex.select('recentRefreshTime_b').from('BOX_CONNECT_TB').where('userID', userID).then(function(rows) {
    var recentRefreshTime = rows[0].recentRefreshTime_b;

    var recent_time = moment(recentRefreshTime);
    /**/
    if (Date.now() - recent_time > EXPIRE_TIME) {
      console.log('====== 만료시간이 넘음 =======');
      refreshBoxToken(userID).then(function(recent_time){
        var i = 0;
        loopRefreshEvent(recent_time, EXPIRE_TIME, userID, i, loopRefreshEvent);
      });

    } else {
      console.log('==== 만료시간이 아직 안됨 ====');

      // recentRefreshTime으로부터 58분이 지난 시점부터 세션 만료전까지 리프레시 이벤트 루프 실행

      var i = 1;
      loopRefreshEvent(recent_time, EXPIRE_TIME, userID, i, loopRefreshEvent);
      /*
      res.send({
        msg: "REFRESH EVENT LOOP WILL RUN PERIODICALLY"
      })
      */

    }
    // 세션 만료 전까지 refresh 정책 루프
    // refresh token 할때마다 엑세스토큰 rest api server로


    // res로 응답하기 -> 안그러면 연결 끊어지면서 소켓 에러 발생
  }).catch(function(err) {
    console.log(err);
  });
});





var refreshBoxToken = function(userID) {
  return new Promise(function(resolve, reject) {
    knex.select('refreshToken_b').from('BOX_CONNECT_TB').where('userID', userID).then(function(rows) {
      console.log('================= Entered refresh part ===============');
      const USER_REFRESH_TOKEN = rows[0].refreshToken_b;
      sdk.getTokensRefreshGrant(USER_REFRESH_TOKEN, function(err, tokenInfo) {
        if (err) {
          console.log(err);
          /*
          if (res) {
            res.send({
              msg: "Access token refresh is failed",
              state: 0,
              err: err
            });
          }
          */
        } else {
          var new_accessToken_b = tokenInfo.accessToken;
          var new_refreshToken_b = tokenInfo.refreshToken;
          knex('BOX_CONNECT_TB').where('userID', userID).update({
            accessToken_b: new_accessToken_b,
            refreshToken_b: new_refreshToken_b
          }).then(function() {
            /* REST API SERVER로 최신 업데이트 이력 및 엑세스토큰 전송 */
            console.log('ACCESS TOKEN IS REFRESHED SUCCESSFULLY!');

            knex.select('recentRefreshTime_b').from('BOX_CONNECT_TB').where('userID', userID)
            .then(function(rows){
                resolve(moment(rows[0].recentRefreshTime_b));
            }).catch(function(err){
              console.log(err)
            })

            /*
            if (res) {
              res.send({
                msg: "Access token is refreshed successfully",
                state: 1
              });
            }
            */
          }).catch(function(err) {
            console.log(err);
            reject(err);
            /*
            if (res) {
              res.send({
                msg: "DB ERROR GENERATED WHEN UPDATING ACCESS_TOKEN",
                state: 0,
                err: err
              });
            }
            */
          });
        }
      })
    }).catch(function(err) {
      console.log(err);
      /*
      if (res) {
        res.sned({
          msg: "DB ERROR GENERATED WHEN EXTRACTING REFRESH_TOKEN",
          state: 0,
          err: err
        });
      }
      */
    });
  })
}


var loopRefreshEvent = function(recent_time, EXPIRE_TIME, userID, i, callback) {
  console.log('---------------ENTER LOOP!--------------');

  var job = schedule.scheduleJob(recent_time + EXPIRE_TIME, function() {
    console.log('================= Schedule ' + i++);

    redis_client.hgetall('USER'+userID, function(err, obj){

      console.log('================== hgetall entered =====================');
      console.log('userID' + userID);
      console.log("obj.isAuthenticated: " + obj.isAuthenticated)
      if(err){
        console.log('REDIS HGETALL ERROR: ' + err);
      } else {
        if(obj.isAuthenticated === "1"){  // state of login
          refreshBoxToken(userID).then(function(msg) {
            console.log(msg);
            knex.select('recentRefreshTime_b').from('BOX_CONNECT_TB').where('userID', userID).then(function(rows){
              var new_recent_time = moment(rows[0].recentRefreshTime_b);
              callback(new_recent_time, EXPIRE_TIME, userID, i, callback);
              job.cancel();
            })
          })
        } else {
          console.log("REFRESH LOOP IS TERMINATED BECAUSE " + userID + " USER LOGOUT");
          return 0;
        }
      }
    });
  });
  return 0;
}







module.exports = router;
