const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const formidable = require('formidable');
const fs = require('fs');
const google_util = require('../app_modules/cpgoogle/google_util.js'); //수정
const google_init = require('../app_modules/cpgoogle/google_init');
const moment = require('moment');
const schedule = require('node-schedule');
const redis_client = require('../app_modules/config/redis');
const request = require('request');

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
  var userId=req.user.userID;
  var folderId= 'root';
  var orderkey;
  console.log("folder");

  redis_client.hget("USER" + userId,'isWaitGoogle',function(err,isWait){
    if(err){
      console.log('redis error');
    }
    else{
      if(isWait>0){
        res.send('드라이브 동기화 중입니다. 최대 소요시간 약 5분');
      }
      else{
        google_util.list(userId,folderId, orderkey, function(fileList){
          if(fileList!=undefined){
            res.render('google_list', {
              FolderID: folderId,
              filelist: fileList
            });
          }
        });
      }
    }
  });
});

router.get('/folder/:id', (req, res) => {
  var userId=req.user.userID;
  var folderId = req.params.id;
  var orderkey;

  redis_client.hget("USER" + userId,'isWaitGoogle',function(err,isWait){
    if(err){
      console.log('redis error');
    }
    else{
      if(isWait>0){
        res.send('드라이브 동기화 중입니다. 최대 소요시간 약 5분');
      }
      else{
        google_util.list(userId,folderId, orderkey, function(fileList){
          if(fileList!=undefined){
            res.render('google_list', {
              FolderID: folderId,
              filelist: fileList
            });
          }
        });
      }
    }
  });
});

router.post('/search/',function(req,res){
  var filelist=JSON.parse(req.body.list);

  console.log(filelist);
  var folderId= 'root';

  res.render('google_list', {
    FolderID: folderId,
    filelist: filelist
  });
});

router.post('/searchtype/',function(req,res){
    var userId=req.user.userID;
    var keyType=req.body.selectType;
    var keyWord=req.body.fileName;
    var orderKey;

    console.log('/searchtype/post : ',userId, keyType);
    google_util.searchType(userId,keyWord,keyType,orderKey, function(filelist){
      res.json(filelist);
    });
});

router.post('/rename/:id',function(req,res){
  console.log('rename 라우터 진입 ');
  google_util.reName(req.user.userID,req.body.fileId,req.params.id,req.body.newname, function(result){
    res.json(result);
  });
});


router.post('/delete/', function(req, res) {
  console.log('rename 라우터 진입 ');
  google_util.deleteFile(req.user.userID,req.body.fileId, function(result){
    res.json(result);
  });
});


router.post('/upload/:id',function(req,res){
  google_init(req.user, function(client) {
    console.log('upload router 진입');
    var folderID = req.params.id;
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
      var FileInfo = files.uploads_list;
      console.log(FileInfo);
      google_util.uploadFile(req.user.userID,FileInfo, folderID, client,function(result){
        res.json(result);
      });
    });
  });
});

// 동시삭제, 동시다운로드 불가 다운로드 및 삭제 방식 변경 필요
router.post('/getthumbnail/',function(req,res){
  var fileId=req.body.path;
  google_init(req.user, function(client) {
    google_util.getThumbnailLink(fileId,client,function(thumbNail){
      var result = [req.body.order, req.body.hashID, thumbNail]
      res.json(result);
    });
  });
});

router.post('/mvdir/:id',function(req,res){
  var fileId=req.body.fileId;
  var folderId=req.body.folderId;
  var CurfolderId = req.params.id;
  console.log(req.body);
  google_init(req.user, function(client) {
    google_util.moveDir(req.user.userID,fileId,folderId,CurfolderId,function(result){
      res.json(result);
    });
  });
});

router.get('/getsize/',function(req,res){
  // var fileId=req.body.fileId;
  // var folderId=req.body.folderId;
  // var CurfolderId = req.params.id;
  google_init(req.user, function(client) {
    google_util.GetSize(client,function(result){
      res.json(result);
    });
  });
});

router.post('/download/',function(req,res){
  console.log('다운로드 돌입');
  var fileId=req.body.id;
  google_init(req.user, function(client) {
    google_util.downloadFile(res,req.user.userID,fileId,client);
  });
});

router.get('/refresh/list/',function(req,res){
  console.log('refresh 진입 ');
  var userId = req.user.userID;
  google_util.refreshList(userId,function(result){
    res.json(result);
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

router.post('/copy/:id',function(req,res){
  google_init(req.user, function(client) {
    var fileId;
    google_util.copyFile(fileId,client);
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

    redis_client.hset("USER" + req.user.userID, "isWaitGoogle", 1, function(err, reply){
      if(err){
        console.log("REDIS ERROR: " + err);
      } else {
        console.log("REDIS REPLY: " + reply);
      }
    });
    
    var data = {"userId" : userID , "CP_love" : accessToken};
    request.post({
      url: 'http://localhost:4000/api/google/set/',
      body : data,
      json : true
    },
      function(error, response, body){
        if(error){
          console.log('rest api server request error!');
        }
        else{
          console.log(body);
          console.log("Complete to register rest API Server - Google ");
          redis_client.hset("USER" + req.user.userID, "isWaitGoogle", 0, function(err, reply){
            if(err){
              console.log("REDIS ERROR: " + err);
            } else {
              console.log("REDIS REPLY: " + reply);
            }
          });
        }
      }
    );

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
    var data = {"userId" : userID};
    request.post({
      url: 'http://localhost:4000/api/google/relieve/',
      body : data,
      json : true
    },
      function(error, response, body){
        if(error) {
          console.log(error);
        }
        else{
          console.log(body);
        }
        console.log("[INFO] " + userID + "\'S GOOGLE TOKEN IS RELIEVED SUCCESSFULLY");
        res.send({
          msg: "Relieved google connection successfully",
          state: 1
        });
      }
    ); 
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

              var data = {
                "user_id": userID,
                "accesstoken": new_accessToken_g
              };
              request.post({
                url: 'http://localhost:4000/api/google/refresh/token/',
                body: data,
                json: true
              }, function(error, response, body){
                console.log('[INFO] ' + userID + '\'S GOOGLE REFERSH TOKEN RESULT: ' + body);
              });

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
