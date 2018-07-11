var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
  if (!req.isAuthenticated())
    res.redirect('/intro');
  else
    return next();
}, function(req, res, next) {
  res.render('index', {
    title: 'Express',
    user: req.user
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




/* GET dynamic pages */
router.get('/page-setting-drive', function(req, res, next) {
  if (!req.isAuthenticated())
    res.redirect('/login');
  else
    return next();
}, function(req, res, next) {
  res.render('page-setting-drive');
})

// router.get('/google', function(req, res, next) {
//   res.render('google_list');
// });


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
