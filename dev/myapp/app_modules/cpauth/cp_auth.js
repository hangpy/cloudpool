module.exports = function(passport){
  var bkfd2Password = require("pbkdf2-password");
  var hasher = bkfd2Password();
  const dbutil = require('../db/db_util');
  var route = require('express').Router();

  route.post(
    '/login',
    passport.authenticate(
      'local',
      {
        successRedirect: '/',
        failureRedirect: '/login_error',
        failureFlash: false
      }
    )
  );


  route.post('/register', function(req, res){
     hasher({password:req.body.cp_password}, function(err, pass, salt, hash){
       var user = {
         user_ID:'local:'+req.body.cp_ID,
         password:hash,
         username:req.body.cp_username,
         salt:salt
       };
       var sql = 'INSERT INTO user_info SET ?';
       dbutil.pool.executeQuery(function(conn) {
                conn.query(sql, user, function(err, results){
                  if(err){
                   console.log(err);
                      res.status(500);
                 } else {
                   req.login(user, function(err){
                     // req.session.save(function(){
                       res.redirect('/');
                     // });
                   });
                 }
               });
        });
     });
   }
 );
   route.get('/logout', function(req, res){
     req.logout();
     //구글 logout 해야된다.
     req.session.save(function(){
       res.redirect('/welcome');
     });
   });
   return route;

}
