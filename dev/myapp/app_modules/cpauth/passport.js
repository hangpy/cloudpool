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
    console.log('serializeUser', user);
    done(null, user);
  });

  //인증후, 사용자 정보를 세션에서 읽어서 request.user에 저장
  passport.deserializeUser(function(user, done) {
    console.log('deserializeUser', user);
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
            hasher({
              password: password,
              salt: user.salt
            }, function(err, pass, salt, hash) {
              if (hash !== user.password) {
                console.log('Password does not match.');
                return done(false, null);
              } else {
                data = {
                  "user_id": user.userID
                }
                request.post({
                  url: 'http://localhost:4000/api/dropbox/login/',
                  body: data,
                  json: true
                }, function(error, response, body) {
                  console.log('========================localhost:4000=========================');
                  console.log(body);
                });

                redis_client.hmset("USER" + user.userID, {
                  "isAuthenticated": 1,
                  "loginIndex": Date.now()
                }, function(err, reply) {
                  if (err) {
                    console.log("REDIS ERROR: " + err);
                  } else {
                    request.get({
                      url: 'http://localhost:3000/box/token/refresh?user_id=' + user.userID,
                    }, function(err, response) {
                      if (err) {
                        console.log(err);
                      } else {

                        console.log('response: ' + response.msg);
                      }
                    });
                    console.log("REDIS REPLY: " + reply);
                  }
                });




                console.log(user.userName + ' is logged in');
                return done(null, user);
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
