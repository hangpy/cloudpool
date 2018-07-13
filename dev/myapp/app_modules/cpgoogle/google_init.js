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
      var usr_access_token='ya29.Gl30BVOuAlBwHT5tqE7-CBOhznf-PWJtx5rl98GdC2H0qt1iWK676sj3tiwiQpzu0qAWIlK77WPZBn5_k8gD_TsWk9gnio3FYhy7Loyd2URB1Mzh4BlNU3g93PadxQw';
      var usr_refresh_token='1/L3aOfOsrMKBvLmh5x4ra-_FHIaV3GeSJ9pqZmU6SaHI';

      oauth2Client.credentials = {
        access_token: usr_access_token,
        refresh_token: usr_refresh_token
      };
      callback(oauth2Client);
      con.release();
    });
  });
};
