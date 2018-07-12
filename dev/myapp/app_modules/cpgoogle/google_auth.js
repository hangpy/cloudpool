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

module.exports = function() {

  const { google } = require('googleapis');
  const client_info = require('../config/client_info');
  const knex = require('../db/knex');

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

  return url;
}
