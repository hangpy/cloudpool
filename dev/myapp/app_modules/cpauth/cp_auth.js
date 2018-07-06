module.exports = function(passport) {
  const dbutil = require('../db/db_util');
  var bkfd2Password = require("pbkdf2-password");
  var hasher = bkfd2Password();
  var route = require('express').Router();
  var knex = require('../db/knex.js');

  route.post(
    '/login',
    passport.authenticate(
      'local', {
        successRedirect: '/',
        failureRedirect: '/login_error',
        failureFlash: false
      }
    )
  );


  route.post('/register', function(req, res) {
    console.log('before hasher');
    hasher({
      password: req.body.cp_password
    }, function(err, pass, salt, hash) {
      knex('USER_INFO_TB').insert({
        userName: req.body.cp_username,
        email: req.body.cp_email,
        salt: salt,
        password: hash
      }).then(function(){
        // db 유저 정보 삽입 성공시
        res.redirect('/');
      }).catch(function(err){
        // db 유저 정보 삽입 실패시
        console.log(err);
        res.status(500);
      });


      //var sql = 'INSERT INTO user_info SET ?';
      //dbutil.pool.executeQuery(function(conn) {
      //  conn.query(sql, user, function(err, results) {
      //    if (err) {
      //      console.log(err);
      //      res.status(500);
      //    } else {
      //      req.login(user, function(err) {
      //        // req.session.save(function(){
      //        res.redirect('/');
      //        // });
      //      });
      //    }
      //  });
      //});


    });
  });


  route.get('/logout', function(req, res) {
    req.logout();
    //구글 logout 해야된다.
    req.session.save(function() {
      res.redirect('/welcome');
    });
  });
  return route;

}
