module.exports = function() {
  var BoxSDK = require('box-node-sdk');
  const client_info = require('../config/client_info');
  const box_client = client_info.BOX;

  const CLIENT_ID = box_client.getClientId(),
        CLIENT_SECRET = box_client.getClientSecret(),
        REDIRECT_URL = box_client.getRedirectUrl();

  var sdk = new BoxSDK({
    clientID: CLIENT_ID, // required
    clientSecret: CLIENT_SECRET // required
  });
  var USER_ACCESS_TOKEN='qEyumwQlZMK9GvQGQlK3EIs917mqnT7y';
  // Create a basic API client
  var client = sdk.getBasicClient(USER_ACCESS_TOKEN);


  client.users.get(client.CURRENT_USER_ID, null, function(err, info){
    if(err)console.log(err);
    else{
      console.log("used : "+ info.space_used);
      console.log("Total : "+ info.space_amount);

    }
  });

  return client;
}


// // 앞단으로부터 사용자 정보 받아서 토큰을 얻어내고 디비에 저장
//
// // 인증한 후에도 다시 인증을 하는 경우
//
// // 인증을 정지하는 경우
//
// // 인증을 아예 해제하는 경우
//
// // 해제하고 다시 인증하는 경우
//
// // 리프레쉬하는 경우
//
// // 위 상황에 대한 모든 에러처리
//
// 'use strict';
//
// /**
//  * @file box_auth - router
//  * @author hangbok
//  *
//  * @description This file is router to authenticate user's box drive
//  *
//  */
//
// module.exports = function() {
//
//   const BoxSDK = require('box-node-sdk');
//   const box_client = require('../config/client_info').BOX;
//   const mysql = require('mysql');
//   const dbutil = require('../db/db_util');
//   const route = require('express').Router();
//   const crypto = require('crypto');
//   const url = require('url');
//   const app = require('express')();
//   const request = require('request');
//
//   const CLIENT_ID = box_client.getClientId();
//   const CLIENT_SECRET = box_client.getClientSecret();
//
//   var sdk = new BoxSDK({
//     clientID: CLIENT_ID,
//     clientSecret: CLIENT_SECRET
//   });
//
//   function generateRedirectURI(req) {
//     return url.format({
//       protocol: req.protocol,
//       host: req.headers.host,
//       pathname: app.path() + '/box/success'
//     });
//   }
//
//
//
//   function generateCSRFToken() {
//     return crypto.randomBytes(18).toString('base64')
//       .replace('///g', '-').replace('/+/g', '_');
//   }
//
//
//   // router when general user use function enrolling authentication about dropbox
//   route.get('/token', function(req, res) {
//
//     var csrfToken = generateCSRFToken();
//     console.log('access /box/token');
//     res.cookie('csrf', csrfToken);
//
//     // https://account.box.com/api/oauth2/authorize
//     // ?response_type=code
//     // &client_id=<MY_CLIENT_ID>
//     // &redirect_uri=<MY_REDIRECT_URL>
//     // &state=<MY_SECURITY_TOKEN>
//
//     res.redirect(url.format({
//       protocol: 'https',
//       hostname: 'account.box.com',
//       pathname: 'api/oauth2/authorize',
//       query: {
//         client_id: CLIENT_ID, //App key of dropbox api
//         response_type: 'code',
//         state: csrfToken,
//         // redirect_uri must be matched with one of enrolled redirect url in dropbox
//         redirect_uri: generateRedirectURI(req)
//       }
//     }));
//
//
//   });
//
//   route.get('/success', function(req, res){
//     console.log('access /box/success');
//     if (req.query.error) {
//       return res.send('ERROR ' + req.query.error + ': ' + req.query.error_description);
//     }
//     if (req.query.state !== req.cookies.csrf) {
//       return res.status(401).send(
//         'CSRF token mismatch, possible cross-site request forgery attempt.'
//       );
//     }
//     // query code will can be catched when user authorize box by login
//     var code = req.query.code;
//     sdk.getTokensAuthorizationCodeGrant(code, null, function(error, tokens){
//       if(error){
//         console.error(error);
//       } else {
//         const USER_ACCESS_TOKEN = tokens.accessToken;
//         const USER_REFRESH_TOKEN = tokens.refreshToken;
//
//         const sql = '';
//         const upsql = '';
//         const user_data = {}; // record to be inserted
//
//         // todo: insert user token into database
//         // if there is token already in database, it must be dealt with
//         dbutil.pool.executeQuery(function(con) {
//           con.query(sql, user_data, function(err, results) {
//
//             // todo
//
//           });
//         });
//
//         console.log('[USER ACCESS TOKEN] ' + USER_ACCESS_TOKEN);
//         console.log('[USER REFRESH TOKEN] ' + USER_REFRESH_TOKEN);
//         res.send('Auth success!');
//       }
//     });
//   });
//
//
//   return route;
// }
