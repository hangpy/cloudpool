const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const knex = require('../app_modules/db/knex');



/* GET home page. */
router.get('/', function(req, res, next) {
  if (!req.isAuthenticated())
    res.redirect('/intro');
  else
    return next();
}, function(req, res, next) {
  knex.select().from('DRIVE_STATE_TB').where('userID', req.user.userID)
  .then(function(rows){
    console.log('Render from /');
    res.render('index', {
      title: 'Express',
      user: req.user,
      drive_state: rows[0]
    });
  })
  .catch(function(err){
    console.log(err);
  });
});

/* GET intro page. */
router.get('/intro', function(req, res, next) {
  if (req.isAuthenticated())
    // res.redirect('/');
    return next();
  else {
    return next();
  }
}, function(req, res, next) {
  res.render('intro', {
    title: 'Intro',
    isUser: req.isAuthenticated()
  });
})


/* GET login page. */
router.get('/login', function(req, res, next) {
  if (req.isAuthenticated())
    res.redirect('/');
  else
    return next();
}, function(req, res, next) {
  res.render('page-login', {
    title: 'login'
  });
});

/* GET register page. */
router.get('/register', function(req, res, next) {
  if (req.isAuthenticated())
    res.redirect('/');
  else
    return next();
}, function(req, res, next) {
  res.render('page-register', {
    title: 'register'
  });
});






// var formidable = require('formidable');
// var google_list=require('../app_modules/cpgoogle/google_list.js');
//
// router.get('/google/', (req,res)=>{
//   ID='\'root\'';
//
//   google_list(ID, function(filelist) { //callback 함수를 통해 정보를 받아온다.
//     console.log("return - 2");
//     res.render('google_list',{
//       FolderID : ID,
//       filelist:filelist
//     });
//   });
//
// });
//
// router.get('/google/:id', (req,res)=>{
//   var folderID = '\''+req.params.id+'\'';
//
//   google_list(folderID, function(filelist){
//     console.log("return - 3");
//
//     res.render('google_list',{
//         FolderID : req.params.id,
//         filelist:filelist
//     });
//   })
// });

module.exports = router;
