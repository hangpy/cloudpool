const formidable = require('formidable');
const router = require('express').Router();
const fs = require('fs');
const box_util = require('../app_modules/cpbox/box_util');
const async = require('async');
const box_init = require('../app_modules/cpbox/box_init');
const moment = require('moment');
const schedule = require('node-schedule');
const redis_client = require('../app_modules/config/redis');
const request = require('request');

/* modules required to get athentication from box */
const BoxSDK = require('box-node-sdk');
const box_client = require('../app_modules/config/client_info').BOX;
const url = require('url');
const app = require('express')();
const box_auth = require('../app_modules/cpbox/box_auth')();
const knex = require('../app_modules/db/knex');

const CLIENT_ID = box_client.getClientId();
const CLIENT_SECRET = box_client.getClientSecret();
/*                 min  sec  milli     */
const EXPIRE_TIME = 59 * 60 * 1000;

var sdk = new BoxSDK({
  clientID: CLIENT_ID,
  clientSecret: CLIENT_SECRET
});

router.get('/folder', function(req, res) {
  var folderID = 0;
  box_util.listFileRest(req.user.userID, folderID, function(filelist) {
    res.render('box_list', {
      FolderID: folderID,
      filelist: filelist
    });
  });
});

router.get('/folder/:id', function(req, res) {
  var folderID = req.params.id;
  box_util.listFileRest(req.user.userID, folderID, function(filelist) {
    res.render('box_list', {
      FolderID: folderID,
      filelist: filelist
    });
  });
});

router.post('/folder/refresh/', function(req, res) {
  box_util.refreshFileRest(req.user.userID, function(result) {
    res.json(result)
  });
});

router.post('/upload/:id', function(req, res) {
  var userID = req.user.userID;
  var folderID = req.params.id;
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    var FileInfo = files.uploadfile;
    box_util.uploadFileRest(userID, folderID, FileInfo, function(result) {
      res.json(result);
    });
  });
})

router.post('/download', function(req, res) {
  box_init(req.user, function(client) {
    var FileID = req.body.name;
    box_util.downloadFile(client, FileID, res);
  });
});

router.post('/delete', function(req, res) {
  var userID = req.user.userID;
  var fileId = req.body.name;
  box_util.deleteFileRest(userID, fileId, function(result){
    res.json(result);
  })
})

router.post('/create', function(req, res) {
  var userID = req.user.userID;
  var folderID = req.body.folderId;
  var foldername = req.body.foldername;
  box_util.createFolderRest(userID, folderID, foldername, function(result) {
    res.json(result);
  });
});

router.post('/rename', function(req, res) {
  var userID = req.user.userID;
  var fileId = req.body.name;
  var filename = req.body.filename;
  box_util.renameFileRest(userID, fileId, filename, function(result) {
    res.json(result);
  });
});

router.post('/movepath', function(req, res) {
  var userID = req.user.userID;
  var fileId = req.body.name;
  var pathId = req.body.pathId;
  box_util.movePathRest(userID, fileId, pathId, function(result) {
    res.json(result);
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
      console.log(filelist);
      res.render('box_list', {
        FolderID: 0,
        filelist: filelist
      });
    });
  });
});

router.post('/space', function(req, res) {
  box_init(req.user, function(client) {
    box_util.spaceCheck(client, function(total, used){
      var space = {
        'total':total,
        'used':used
      }
      res.json(space);
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
  var userID = req.user.userID;
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
        userID: userID,
        accessToken_b: USER_ACCESS_TOKEN,
        refreshToken_b: USER_REFRESH_TOKEN
      }).then(function() {
        res.redirect("/");
        knex.select('recentRefreshTime_b').from('BOX_CONNECT_TB').where('userID', userID).then(function(rows) {
          var recent_time = moment(rows[0].recentRefreshTime_b);
          redis_client.hgetall('USER' + userID, function(err, obj) {
            var i = 1;
            loopRefreshEvent(recent_time, EXPIRE_TIME, userID, obj.loginIndex, i, loopRefreshEvent);
          });
        }).catch(function(err) {
          console.log(err);
        });
        //register REST API server
        data = {
          "user_id" : userID,
          "accesstoken" : USER_ACCESS_TOKEN
        };
        request.post({
            url: 'http://localhost:4000/api/box/set/',
            body: data,
            json: true
          },
          function(error, response, body) {
            console.log("Complete register rest API Server");
          });
      }).catch(function(err) {
        console.log(err);
        res.status(500);
      });
    }
  });
});

router.get('/refresh', function(req, res) {
  var userID = req.user.userID;
  knex.select('refreshToken_b')
    .from('BOX_CONNECT_TB')
    .where('userID', userID)
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
          knex('BOX_CONNECT_TB').where('userID', userID)
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

router.get('/relieve', function(req, res, next) {
  var userID = req.user.userID;
  knex.delete().from('BOX_CONNECT_TB').where('userID', userID).then(function(rows) {
    box_util.relieveRest(userID, function(result){
      if(result=='success'){
        console.log("[INFO] " + userID + "\'S BOX TOKEN IS RELIEVED SUCCESSFULLY");
        res.send({
          msg: "Relieved box connection successfully",
          state: 1
        });
      } else{
        console.log(result);
        res.send({
          msg: "Failed to relieved box token",
          state: 0
        })
      }
    })
  }).catch(function(err) {
    console.log(err);
    res.send({
      msg: "Failed to relieved box token",
      state: 0
    })
  });
});

router.get('/token/refresh', function(req, res, next) {
  var userID = req.query.user_id;
  console.log("req.user.userID: " + userID);
  // 사용자가 박스를 등록을 했을 때 시행
  knex.select('recentRefreshTime_b').from('BOX_CONNECT_TB').where('userID', userID).then(function(rows) {
    var recentRefreshTime = rows[0].recentRefreshTime_b;
    var recent_time = moment(recentRefreshTime);
    if (Date.now() - recent_time > EXPIRE_TIME) {
      console.log('[INFO] ' + userID + ' USER\'S BOX ACCESS TOKEN IS ALREADY EXPIRED');
      refreshBoxToken(userID).then(function(recent_time) {
        redis_client.hgetall('USER' + userID, function(err, obj) {
          var i = 1;
          loopRefreshEvent(recent_time, EXPIRE_TIME, userID, obj.loginIndex, i, loopRefreshEvent);
        });
      });
    } else {
      console.log('[INFO] ' + userID + ' USER\'S BOX ACCESS TOKEN IS NOT YET EXPIRED');
      redis_client.hgetall('USER' + userID, function(err, obj) {
        var i = 1;
        loopRefreshEvent(recent_time, EXPIRE_TIME, userID, obj.loginIndex, i, loopRefreshEvent);
      });
      res.send({
        msg: "BOX TOKEN REFRESH EVENT LOOP WILL RUN PERIODICALLY"
      })
    }
    // refresh token 할때마다 엑세스토큰 rest api server로
    // res로 응답하기 -> 안그러면 연결 끊어지면서 소켓 에러 발생
  }).catch(function(err) {
    console.log(err);
  });
});

var refreshBoxToken = function(userID) {
  return new Promise(function(resolve, reject) {
    knex.select('refreshToken_b').from('BOX_CONNECT_TB').where('userID', userID).then(function(rows) {
      const USER_REFRESH_TOKEN = rows[0].refreshToken_b;
      sdk.getTokensRefreshGrant(USER_REFRESH_TOKEN, function(err, tokenInfo) {
        if (err) {
          console.log(err);
        } else {
          var new_accessToken_b = tokenInfo.accessToken;
          var new_refreshToken_b = tokenInfo.refreshToken;
          knex('BOX_CONNECT_TB').where('userID', userID).update({
            accessToken_b: new_accessToken_b,
            refreshToken_b: new_refreshToken_b
          }).then(function() {
            /* REST API SERVER로 최신 업데이트 이력 및 엑세스토큰 전송 */
            console.log('[INFO] ' + userID + ' USER\'S BOX ACCESS TOKEN IS REFRESHED SUCCESSFULLY!');
            knex.select('recentRefreshTime_b').from('BOX_CONNECT_TB').where('userID', userID)
              .then(function(rows) {
                var data = {
                  "user_id": userID,
                  "accesstoken": new_accessToken_b
                };
                request.post({
                  url: 'http://localhost:4000/api/box/refresh/token/',
                  body: data,
                  json: true
                }, function(error, response, body){
                  console.log('[INFO] ' + userID + '\'S BOX REFERSH TOKEN RESULT: ' + body);
                });
                resolve(moment(rows[0].recentRefreshTime_b));
              }).catch(function(err) {
                console.log(err)
              })
          }).catch(function(err) {
            console.log(err);
            reject(err);
          });
        }
      })
    }).catch(function(err) {
      console.log(err);
    });
  })
}

var loopRefreshEvent = function(recent_time, EXPIRE_TIME, userID, loginIndex, i, callback) {
  console.log('[INFO] ' + userID + ' USER\'S BOX ACCESS TOKEN WILL BE REFRESHED AT ' + recent_time);
  var job = schedule.scheduleJob(recent_time + EXPIRE_TIME, function() {
    console.log('[INFO] ' + userID + ' USER\'S BOX REFRESH EVENT LOOP RUN IN ' + i++ + ' TIME');
    redis_client.hgetall('USER' + userID, function(err, obj) {
      if (err) {
        console.log('[ERROR] REDIS HGETALL ERROR: ' + err);
      } else {
        if (obj.isAuthenticated === "1" && obj.loginIndex === loginIndex) { // state of login
          refreshBoxToken(userID).then(function(msg) {
            knex.select('recentRefreshTime_b').from('BOX_CONNECT_TB').where('userID', userID).then(function(rows) {
              var new_recent_time = moment(rows[0].recentRefreshTime_b);
              callback(new_recent_time, EXPIRE_TIME, userID, obj.loginIndex, i, callback);
              job.cancel();
            })
          })
        } else {
          console.log('[INFO] ' + userID + ' USER\'S BOX REFRESH EVENT LOOP NO LONGER RUN');
          return 0;
        }
      }
    });
  });
  return 0;
}



module.exports = router;
