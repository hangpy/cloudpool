"use strict";

/**
* @file google_init
* @author hangbok
*
* @description This module is for simplifying process of getting google auth
* @param {object, callback}
* return value invovles google user's access and refresh token attributes within
* oauth2Client.credentials
*/
const {google} = require('googleapis');
const client_info = require('../config/client_info');
const mysql = require('mysql');
const dbutil = require('../db/db_util');

module.exports = function(usr_session, callback){

  // Select google client info part out of several drives
  const google_client = client_info.GOOGLE;
  var OAuth2 = google.auth.OAuth2;

  var CLIENT_ID = google_client.getClientId(),
      CLIENT_SECRET = google_client.getClientSecret(),
      REDIRECT_URL = google_client.getRedirectUrl();

  var oauth2Client = new OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URL
  );

  /**
  * @todo usr_info 사용
  */

  dbutil.pool.executeQuery(function(con){
    // 로그인 사용자 정보에 따라 토큰 구별
    con.query('select * from user_token', function(err, result, fields){
      if(err){
        con.release();
        throw err;
      }

      // usr_access_token = result[0].Gaccess;
      // usr_refresh_token = result[0].Grefresh;
      var usr_access_token='ya29.Glv0Bf4DJwl6_2RXS9UOU-LoZCbiudmX9Ff1Jr8dE8kiTn-nwcYQ0rfKpy7WnBNUZhJ3M3qPEfs7QI700DROifuQwIwAFloIrZ2DkiU_FLnUxuGqEnj8bdGc6BBn';
      var usr_refresh_token='1/hINc3cnOlfwviix4DVdr2AJURRyBAshUYMRGldoBu0-qF89GW_6dsaI7Q3-IwJV4';

      oauth2Client.credentials = {
        access_token: usr_access_token,
        refresh_token: usr_refresh_token
      };
      callback(oauth2Client);
      con.release();
    });
  });
};
