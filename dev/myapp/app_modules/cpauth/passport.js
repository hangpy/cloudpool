const dbutil = require('../db/db_util');
const bkfd2Password = require("pbkdf2-password");
const LocalStrategy = require('passport-local').Strategy;
// var GoogleDriveStrategy = require('passport-google-drive').Strategy;
const knex = require('../db/knex.js');
const hasher = bkfd2Password();
const request = require('request');
const redis = require('redis');
const redis_client = require('../config/redis');

module.exports = function(passport) {

  //인증후 사용자 정보를 세션에 저장
  passport.serializeUser(function(user, done) {
    console.log('[INFO] ' + user.userID + '\'S SESSION VALUES ARE STORED IN SESSION: \n', user);
    done(null, user);
  });

  //인증후, 사용자 정보를 세션에서 읽어서 request.user에 저장
  passport.deserializeUser(function(user, done) {
    console.log('[INFO] ' + user.userID + '\'S FOLLOWING SESSION VALUES ARE ATTACHED TO req.user: \n', user);
    done(null, user);
  });




  passport.use('local-login', new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password'
    },
    function(email, password, done) {

      knex.select().from('USER_INFO_TB').where('email', email)
        .then(function(rows) {
          if (rows.length === 0) {
            console.log('There is no that user.');
            return done(false, null);
          } else {
            var user = rows[0];
            var userID = rows[0].userID
            /* session define */
            var session = {
              userID: userID,
              email: rows[0].email,
              userName: rows[0].userName
            }
            hasher({
              password: password,
              salt: user.salt
            }, function(err, pass, salt, hash) {
              if (hash !== user.password) {
                console.log('Password does not match.');
                return done(false, null);
              } else {
                data = {
                  "user_id": userID
                }
                knex.select().from('DRIVE_STATE_TB').where('userID', userID).then(function(rows){
                  var google_state = rows[0].googleCount;
                  var dropbox_state = rows[0].dropboxCount;
                  var box_state = rows[0].boxCount;

                  if(googleCount > 0) {

                  } else {

                  }

                  if(dropboxCount > 0) {
                    request.post({
                      url: 'http://localhost:4000/api/dropbox/login/',
                      body: data,
                      json: true
                    }, function(error, response, body) {
                      console.log('========================localhost:4000=========================');
                      console.log(body);
                    });
                  } else {
                    console.log('[INFO] ' + userID + ' USER\'S DROPBOX DRIVE IS NOT YET CONNECTED');
                  }

                  if(boxCount > 0) {
                    knex.select('accessToken_b').from('BOX_CONNECT_TB').where('userID', userID).then(function(rows){
                      console.log('[INFO] ' + userID + ' USER\'S BOX TOKEN IS SENDED TO REST SERVER');
                      request.post({
                        url: 'http://localhost:4000/api/box/refresh/token/',
                        body: data,
                        json: true,
                        accessToken: rows[0].accessToken_b;
                      }, function(error, response, body){
                        console.log(body);
                      })
                    }).catch(function(err){
                      console.log(err);
                    });
                    request.post({
                      url: 'http://localhost:4000/api/box/login/',
                      body: data,
                      json: true,
                      accessToken: rows[0].accessToken_b;
                    }, function(error, response, body) {
                      console.log('========================localhost:4000=========================');
                      console.log(body);
                    });

                  } else {
                    console.log('[INFO] ' + userID + ' USER\'S BOX DRIVE IS NOT YET CONNECTED');
                  }

                }).catch(function(err){
                  console.log(err);
                });

                redis_client.hmset("USER" + userID, {
                  "isAuthenticated": 1,
                  "loginIndex": Date.now()
                }, function(err, reply) {
                  if (err) {
                    console.log("REDIS ERROR: " + err);
                  } else {
                    knex.select().from('DRIVE_STATE_TB').where('userID', userID)
                    .then(function(rows){

                      var google_state = rows[0].googleCount;
                      var dropbox_state = rows[0].dropboxCount;
                      var box_state = rows[0].boxCount;

                      if(google_state > 0){
                        request.get({
                          url: 'http://localhost:3000/google/token/refresh?user_id=' + userID,
                        }, function(err, response) {
                          if (err) {
                            console.log(err);
                          } else {
                            console.log('response: ' + response.msg);
                          }
                        });
                      }

                      if(box_state > 0){
                        request.get({
                          url: 'http://localhost:3000/box/token/refresh?user_id=' + userID,
                        }, function(err, response) {
                          if (err) {
                            console.log(err);
                          } else {
                            console.log('response: ' + response.msg);
                          }
                        });
                      }
                    }).catch(function(err){
                      console.log(err);
                    });
                    console.log("REDIS REPLY: " + reply);
                  }
                });

                console.log('[INFO] ' + userID + ' IS LOGGED IN');
                return done(null, session);
              }
            });
          }
        })
        .catch(function(err) {
          console.log(err);
          return done(false, null);
        });
    }
  ));
  //
  // passport.use(new GoogleDriveStrategy({
  //     clientID: '1020724062873-q2905dvpi2rkp2afc5geu3ib136mo21e.apps.googleusercontent.com',
  //     clientSecret: 'wYcSZSLwufXFLAaH7xFi9Rby',
  //     callbackURL: "http://localhost:3000/auth/google/callback"
  //   },
  //   function( accessToken, refreshToken, profile, done) {
  //       // User.findOrCreate({ googleId: profile.id }, function (err, user) {
  //
  //     console.log("Accesstoken : " + accessToken);
  //     console.log("RefreshToken : " + refreshToken);
  //     console.log("Profile : " + profile.id);
  //     var token= {
  //        accesstoken : accessToken,
  //        refreshtoken : refreshToken
  //
  //     }
  //     // var user = {
  //     //     access : accessToken,
  //     //     refresh : refreshToken,
  //     //     name : profile
  //     //   };
  //          return done(null, token);
  //       // });
  //   }
  // ));



}
