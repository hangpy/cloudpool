module.exports = function(passport) {
  // need passport object as parameter was set in passport.js
  const dbutil = require('../db/db_util');
  var bkfd2Password = require("pbkdf2-password");
  var hasher = bkfd2Password();
  var route = require('express').Router();
  var knex = require('../db/knex.js');
  const request = require('request');


  route.post('/login', passport.authenticate(
    'local-login', {
      successRedirect: '/',
      failureRedirect: '/login', // message 필요
      successFlash: true,
      failureFlash: true
    }
  ));

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
      }).then(function() {
        // db 유저 정보 삽입 성공시 intro 창으로 이동
        res.redirect('/intro');
      }).catch(function(err) {
        // db 유저 정보 삽입 실패시 등록 실패 메시지
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


  // logout and remove session
  route.get('/logout', function(req, res, next) {
    if (!req.isAuthenticated())
      res.redirect('/login');
    else
      return next();
  }, function(req, res, next) {

    //send logout status restapi server
    data={
      "user_id" : req.user.userID
    }
    request.post({
      url: 'http://localhost:4000/api/dropbox/logout/',
      body : data,
      json : true
    },
      function(error, response, body){
        console.log(body);
      }
    );

    req.logout();
    res.redirect('/intro');
  });

  route.get('/check_email', function(req, res, next) {
    if (req.isAuthenticated())
      res.redirect('/');
    else
      return next();
  }, function(req, res, next) {
    var email = req.param('email');
    console.log("got " + email);
    knex.select('email').from("USER_INFO_TB").where('email', email)
      .then(function(rows) {
        if(rows.length == 0){
          console.log(rows[0]);
          res.send({
            result: 0
          });
        } else {
          res.send({
            result: 1
          });
        }
      })
      .catch(function(err) {
        console.log(err);
      })
  });


  // route.get('/logout', function(req, res) {
  //   req.logout();
  //   //구글 logout 해야된다.
  //   req.session.save(function() {
  //     res.redirect('/welcome');
  //   });
  // });


  return route;

}
