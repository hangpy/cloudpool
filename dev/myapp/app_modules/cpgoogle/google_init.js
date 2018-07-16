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
const knex = require('../db/knex');

module.exports = function(user_session, callback){

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

  console.log("--------------2---------------");

  knex.select('accessToken_g', 'refreshToken_g').from('GOOGLE_CONNECT_TB').where('userID', user_session.userID)
  .then(function(rows){
    const USER_ACCESS_TOKEN = rows[0].accessToken_g;
    const USER_REFRESH_TOKEN = rows[0].refreshToken_g;
    oauth2Client.credentials = {
      access_token: USER_ACCESS_TOKEN,
      refresh_token: USER_REFRESH_TOKEN
    };
    var client = oauth2Client;
    console.log("select before callback")
    callback(client);
  })
  .catch(function(err){
    console.log('--------select error----------')
    console.log(err);
  });
};
