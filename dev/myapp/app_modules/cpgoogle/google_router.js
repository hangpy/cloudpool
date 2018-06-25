var express = require('express');
// var bodyParser = require('body-parser');
var router = express.Router();
var formidable = require('formidable');
var google_list=require('./google_list.js');

router.get('/', (req,res)=>{

  ID='\'root\'';

  google_list(ID, function(filelist) { //callback 함수를 통해 정보를 받아온다.
    console.log("return - 2");
    res.render('google_list',{
      FolderID : ID,
      filelist:filelist
    });
  });

});

router.get('/:id', (req,res)=>{
  var folderID = '\''+req.params.id+'\'';

  google_list(folderID, function(filelist){
    console.log("return - 3");

    res.render('google_list',{
        FolderID : req.params.id,
        filelist:filelist
    });
  })
});



// /* GET login page. */
// router.get('/login', function(req, res, next) {
//   res.render('page-login', { title: 'login' });
// });

// /* GET register page. */
// router.get('/register', function(req, res, next) {
//   res.render('page-register', { title: 'register' });
// });

// /* GET main dasboard page. */
// router.get('/dashboard', function(req, res, next) {
//   res.render('welcome');
// });

// /* GET register page. */
// router.get('/graph', function(req, res, next) {

//   res.render('graph_test');
// });

// router.get('/card', function(req, res, next) {
//   res.render('card_test');
// });
// var indexRouter = require('./routes/index');


module.exports = router;
