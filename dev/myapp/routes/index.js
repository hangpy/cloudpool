var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET login page. */
router.get('/login', function(req, res, next) {
  res.render('page-login', { title: 'login' });
});

/* GET register page. */
router.get('/register', function(req, res, next) {
  res.render('page-register', { title: 'register' });
});




/* GET register page. */
router.get('/graph', function(req, res, next) {
  res.render('graph_test');
});

router.get('/card', function(req, res, next) {
  res.render('card_test');
});


module.exports = router;
