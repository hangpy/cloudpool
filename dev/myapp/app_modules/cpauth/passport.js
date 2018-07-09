const dbutil = require('../db/db_util');
var bkfd2Password = require("pbkdf2-password");
var LocalStrategy = require('passport-local').Strategy;
// var GoogleDriveStrategy = require('passport-google-drive').Strategy;
var knex = require('../db/knex.js');
var hasher = bkfd2Password();


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
