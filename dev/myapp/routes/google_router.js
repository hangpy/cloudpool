const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const formidable = require('formidable');
const fs = require('fs');
const google_util = require('../app_modules/cpgoogle/google_util.js'); //수정
const google_init = require('../app_modules/cpgoogle/google_init');
const moment = require('moment');
const schedule = require('node-schedule');
const redis_client = require('../app_modules/config/redis')

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

/*                 min  sec  milli     */
const EXPIRE_TIME = 59 * 60 * 1000;

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
  var userID = req.user.userID;
  console.log("enter the /google/callback and userID is " + userID);
  var code = req.query.code;
  oauth2Client.getToken(code, function(error, tokens) {
    if (error) {
      res.send(error)
    };

    var accessToken = tokens.access_token;
    var refreshToken = tokens.refresh_token;

    if(refreshToken == null){
      knex.select('refreshToken_g').from('GOOGLE_RELIEVE_TB').where('userID', userID).then(function(rows){
        if(rows != null){
          refreshToken = rows[0].refreshToken_g;
          knex('GOOGLE_CONNECT_TB').insert({
            // todo: session에서 userID 추출
            userID: userID,
            accessToken_g: accessToken,
            refreshToken_g: refreshToken
          }).then(function() {
            knex.delete().from('GOOGLE_RELIEVE_TB').where({userID: userID, refreshToken_g: refreshToken}).then(function(rows){
              console.log("[INFO] " + userID + "\'S RELIEVE ROW IS DELETED FROM GOOGLE_RELIEVE_TB");
            });
            res.redirect('/');
            knex.select('recentRefreshTime_g').from('GOOGLE_CONNECT_TB').where('userID', userID).then(function(rows) {
              var recent_time = moment(rows[0].recentRefreshTime_g);
              redis_client.hgetall('USER'+userID, function(err, obj){
                var i = 1;
                loopRefreshEvent(recent_time, EXPIRE_TIME, userID, obj.loginIndex , i, loopRefreshEvent);
              });
            }).catch(function(err){
              console.log(err);
            });
          }).catch(function(err) {
            console.log(err);
            res.status(500);
          });
        } else {
          console.log('[ERR] something is wrong when getting refresh token from google_relieve_tb');
        }
      });
    } else {
      knex('GOOGLE_CONNECT_TB').insert({
        // todo: session에서 userID 추출
        userID: userID,
        accessToken_g: accessToken,
        refreshToken_g: refreshToken
      }).then(function() {
        res.redirect('/');
        knex.select('recentRefreshTime_g').from('GOOGLE_CONNECT_TB').where('userID', userID).then(function(rows) {
          var recent_time = moment(rows[0].recentRefreshTime_g);
          redis_client.hgetall('USER'+userID, function(err, obj){
            var i = 1;
            loopRefreshEvent(recent_time, EXPIRE_TIME, userID, obj.loginIndex , i, loopRefreshEvent);
          });
        }).catch(function(err){
          console.log(err);
        });
      }).catch(function(err) {
        console.log(err);
        res.status(500);
      });
    }
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
            msg: "Failed to refresh token, check database",
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

router.get('/relieve', function(req, res, next){
  var userID = req.user.userID;
  knex.delete().from('GOOGLE_CONNECT_TB').where('userID', userID).then(function(rows){
    console.log("[INFO] " + userID + "\'S GOOGLE TOKEN IS RELIEVED SUCCESSFULLY");
    res.send({
      msg: "Relieve google connection successfully",
      state: 1
    });
  }).catch(function(err){
    console.log(err);
    res.send({
      msg: "Failed to relieved google token",
      state: 0
    })
  });
});

router.get('/token/refresh', function(req, res, next){
  var userID = req.query.user_id;
  console.log("req.user.userID: " + userID);
  // 사용자가 구글을 등록을 했을 때 시행
  knex.select('recentRefreshTime_g').from('GOOGLE_CONNECT_TB').where('userID', userID).then(function(rows) {
    var recentRefreshTime = rows[0].recentRefreshTime_g;
    var recent_time = moment(recentRefreshTime);
    if (Date.now() - recent_time > EXPIRE_TIME) {
      console.log('[INFO] ' + userID + ' USER\'S GOOGLE ACCESS TOKEN IS ALREADY EXPIRED');
      refreshGoogleToken(userID).then(function(recent_time){
        redis_client.hgetall('USER'+userID, function(err, obj){
          var i = 1;
          loopRefreshEvent(recent_time, EXPIRE_TIME, userID, obj.loginIndex , i, loopRefreshEvent);
        });
      });
    } else {
      console.log('[INFO] ' + userID + ' USER\'S GOOGLE ACCESS TOKEN IS NOT YET EXPIRED');
      redis_client.hgetall('USER'+userID, function(err, obj){
        var i = 1;
        loopRefreshEvent(recent_time, EXPIRE_TIME, userID, obj.loginIndex , i, loopRefreshEvent);
      });
      res.send({
        msg: "GOOGLE TOKEN REFRESH EVENT LOOP WILL RUN PERIODICALLY"
      })
    }
    // refresh token 할때마다 엑세스토큰 rest api server로
    // res로 응답하기 -> 안그러면 연결 끊어지면서 소켓 에러 발생
  }).catch(function(err) {
    console.log(err);
  });
});

var refreshGoogleToken = function(userID) {
  return new Promise(function(resolve, reject) {
    knex.select('accessToken_g', 'refreshToken_g').from('GOOGLE_CONNECT_TB').where('userID', userID).then(function(rows) {
      const USER_REFRESH_TOKEN = rows[0].refreshToken_g;

      oauth2Client.credentials = {
        access_token: rows[0].accessToken_g,
        refresh_token: rows[0].refreshToken_g
      };
      oauth2Client.refreshAccessToken(function(err, tokens){
        if(err){
          console.log(err);
        } else {
          var new_accessToken_g = tokens.access_token;
          knex('GOOGLE_CONNECT_TB').where('userID', userID).update({
            accessToken_g: new_accessToken_g
          }).then(function() {
            /* REST API SERVER로 최신 업데이트 이력 및 엑세스토큰 전송 */
            console.log('[INFO] ' + userID + ' USER\'S GOOGLE ACCESS TOKEN IS REFRESHED SUCCESSFULLY!');
            knex.select('recentRefreshTime_g').from('GOOGLE_CONNECT_TB').where('userID', userID)
            .then(function(rows){
                resolve(moment(rows[0].recentRefreshTime_g));
            }).catch(function(err){
              console.log(err)
            })
          }).catch(function(err) {
            console.log(err);
            reject(err);
          });
        }
      });
    }).catch(function(err) {
      console.log(err);
    });
  })
}

var loopRefreshEvent = function(recent_time, EXPIRE_TIME, userID, loginIndex, i, callback) {
  console.log('[INFO] ' + userID + ' USER\'S GOOGLE ACCESS TOKEN WILL BE REFRESHED AT ' + recent_time);
  var job = schedule.scheduleJob(recent_time + EXPIRE_TIME, function() {
    console.log('[INFO] ' + userID + ' USER\'S GOOGLE REFRESH EVENT LOOP RUN IN ' + i++ + ' TIME');
    redis_client.hgetall('USER'+userID, function(err, obj){
      if(err){
        console.log('[ERROR] REDIS HGETALL ERROR: ' + err);
      } else {
        if(obj.isAuthenticated === "1" && obj.loginIndex === loginIndex){  // state of login
          refreshGoogleToken(userID).then(function(msg) {
            knex.select('recentRefreshTime_g').from('GOOGLE_CONNECT_TB').where('userID', userID).then(function(rows){
              var new_recent_time = moment(rows[0].recentRefreshTime_g);
              callback(new_recent_time, EXPIRE_TIME, userID, obj.loginIndex, i, callback);
              job.cancel();
            })
          })
        } else {
          console.log('[INFO] ' + userID + ' USER\'S GOOGLE REFRESH EVENT LOOP NO LONGER RUN');
          return 0;
        }
      }
    });
  });
  return 0;
}


module.exports = router;
