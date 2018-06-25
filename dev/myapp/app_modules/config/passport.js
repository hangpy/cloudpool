module.exports = function(app){
  const dbutil = require('../db/db_util');
  var bkfd2Password = require("pbkdf2-password");
  var passport = require('passport');
  var LocalStrategy = require('passport-local').Strategy;
  var GoogleDriveStrategy = require('passport-google-drive').Strategy;

  var hasher = bkfd2Password();
  app.use(passport.initialize());
  app.use(passport.session());

  //인증후 사용자 정보를 세션에 저장
  passport.serializeUser(function(user, done) {
     console.log('serializeUser', user);
     done(null, user.user_ID);
   });

//인증후, 사용자 정보를 세션에서 읽어서 request.user에 저장
   passport.deserializeUser(function(id, done) {
     console.log('deserializeUser', id);
     var sql = 'SELECT * FROM user_info WHERE user_ID=?';

    dbutil.pool.executeQuery(function(conn) {
       conn.query(sql, [id], function(err, results){
         if(err){
           console.log(err);
           done('There is no user.');
         } else {

           done(null, results[0]);
         }
       });
     });
   });

   passport.use(new LocalStrategy(
     function(username, password, done){
       var uname = username;
       var pwd = password;
       var sql = 'SELECT * FROM user_info WHERE user_ID=?';
       dbutil.pool.executeQuery(function(conn) {
             conn.query(sql, ['local:'+uname], function(err, results){
                  if(err){
                   return done('There is no user.');
                  }
                  else{
                    var user = results[0];
                    if(user)
                    {

                     return hasher({password:pwd, salt:user.salt}, function(err, pass, salt, hash){
                       if(hash === user.password){
                         console.log('LocalStrategy', user);
                         done(null, user);
                       } else {
                         done(null, false);
                       }
                     });
                   }
                   else done(null, false);
                 }
             });
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



   return passport;
}
