'use strict';

/**
* @file google_auth - router
* @author hangbok
*
* @description This file is router to authenticate user's google drive
* @param {object, callback}
* return value invovles google user's access and refresh token attributes within
* oauth2Client.credentials
*/

//windows code linux용으로 바꾸기

module.exports = function() {

  const {
    google
  } = require('googleapis');
  const client_info = require('../config/client_info');
  const mysql = require('mysql');
  const dbutil = require('../db/db_util');
  const route = require('express').Router();


  const google_client = client_info.GOOGLE;
  var OAuth2 = google.auth.OAuth2;

  const CLIENT_ID = google_client.getClientId(),
        CLIENT_SECRET = google_client.getClientSecret(),
        REDIRECT_URL = google_client.getRedirectUrl();

  var oauth2Client = new OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URL
  );


  var scopes = [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/userinfo.profile'
  ];

  var url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token)
    scope: scopes // If you only need one scope you can pass it as string
  });
  // generate a url that asks permissions for Google+ and Google Calendar scopes
  //google accesstoken/ refreshtoken 얻기

  route.get('/callback', function(req, res) {
    var code = req.query.code;
    oauth2Client.getToken(code, function(error, tokens) {
      if (error) {
        res.send(error)
      };

      var accessToken = tokens.access_token;
      var refreshToken = tokens.refresh_token;

      // console.log('The ID From DB ' + req.user._id);

      // todo: configure data object to be inserted into database
      var data = {

      };
      var dataArr = [];

      var sql = 'INSERT INTO user_token SET ?';
      var upsql = 'UPDATE user_token SET Gaccess = ?, Grefresh=? WHERE user_ID=?'

      dbutil.pool.executeQuery(function(con) {
        con.query(sql, data, function(err, results) {
          if (err) {
            // todo: error 정의
            console.log("Error in insert job: " + err);
            con.release();
            dbutil.pool.executeQuery(function(con_second) {
              con_second.query(upsql, dataArr, function(err, results) {
                if (err) {
                  // todo: error 정의
                  console.log("Error in update job" + err);
                  con_second.release();
                  // todo: define where will be redirected
                  res.redirect('');
                } else {
                  // todo: define wokrking after update working successfully
                  res.render('', {

                  });
                  con_second.release();
                }
              });
            });
          } else {
            // todo: define wokrking after insert working successfully
            res.render('', {

              // todo

            });
            con.release();
          }
        })
      });
    });
  })
  return route;
}
