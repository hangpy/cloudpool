const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const knex = require('../app_modules/db/knex');


/* url for requiring user access token */
const google_reqToken_url = require('../app_modules/cpgoogle/google_auth')();
// const dropbox_reqToken_url = require('../app_modules/cpdropbox/dropbox_auth')();
// const box_reqToken_url = require('../app_modules/cpbox/box_auth')();



/* GET dynamic pages */
router.get('/page-setting-drive', function(req, res, next) {
  if (!req.isAuthenticated())
    res.redirect('/login');
  else
    return next();
}, function(req, res, next) {
  /* Before render page, check drive state of each user from database */
  knex.select().from('DRIVE_STATE_TB').where('userID', req.user.userID)
  .then(function(rows){
    res.render('page-setting-drive',{
      google_url: google_reqToken_url,
      drive_state: rows[0]
      // box_url: box_reqToken_url
    });
  })
  .catch(function(){

  });
});




module.exports = router;
