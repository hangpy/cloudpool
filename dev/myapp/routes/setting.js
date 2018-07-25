const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const knex = require('../app_modules/db/knex');
const moment = require('moment');
const schedule = require('node-schedule');

const BoxSDK = require('box-node-sdk');
const box_client = require('../app_modules/config/client_info').BOX;
const box_auth = require('../app_modules/cpbox/box_auth')();
const CLIENT_ID = box_client.getClientId();
const CLIENT_SECRET = box_client.getClientSecret();
var box_sdk = new BoxSDK({
  clientID: CLIENT_ID,
  clientSecret: CLIENT_SECRET
});

/* url for requiring user access token */
const google_reqToken_url = require('../app_modules/cpgoogle/google_auth')();
// const dropbox_reqToken_url = require('../app_modules/cpdropbox/dropbox_auth')();
// const box_reqToken_url = require('../app_modules/cpbox/box_auth')();



/* GET dynamic pages */
router.get('/page-setting-drive', function(req, res, next) {

  const request = require('request');
  console.log("session: " + request.user);

  if (!req.isAuthenticated())
    res.redirect('/login');
  else
    return next();
}, function(req, res, next) {
  /* Before render page, check drive state of each user from database */
  knex.select().from('DRIVE_STATE_TB').where('userID', req.user.userID)
  .then(function(rows){
    console.log('Render from /page-setting-drive');
    res.render('page-setting-drive',{
      google_url: google_reqToken_url,
      drive_state: rows[0]
      // box_url: box_reqToken_url
    });
  })
  .catch(function(err){
    console.log(err);
  });
});




router.get('/token/refresh', function(req, res) {
  res.redirect('/');

});





module.exports = router;
