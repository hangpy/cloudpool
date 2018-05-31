'use strict';

/**
 * @file dropbox_auth - router
 * @author hangbok
 *
 * @description This file is router to authenticate user's dropbox drive
 *
 */

module.exports = function() {

  const dropbox_client = require('../config/client_info').DROPBOX;
  const mysql = require('mysql');
  const dbutil = require('../db/db_util');
  const route = require('express').Router();
  const crypto = require('crypto');
  const url = require('url');
  const app = require('express')();
  const request = require('request');

  // generate URI based on path current app is working
  function generateRedirectURI(req) {
    return url.format({
      protocol: req.protocol,
      host: req.headers.host,
      pathname: app.path() + '/dropbox/success'
    });
  }


  // generate token to protect CSRF attack
  function generateCSRFToken() {
    return crypto.randomBytes(18).toString('base64')
      .replace('///g', '-').replace('/+/g', '_');
  }

  // router when general user use function enrolling authentication about dropbox
  route.get('/token', function(req, res) {
    var csrfToken = generateCSRFToken();
    console.log('access /dropbox/token');
    // app.use(require('cookie-parser')); 있어야만 됨.
    res.cookie('csrf', csrfToken);
    res.redirect(url.format({
      protocol: 'https',
      hostname: 'www.dropbox.com',
      pathname: '1/oauth2/authorize',
      query: {
        client_id: dropbox_client.getClientId(), //App key of dropbox api
        response_type: 'code',
        state: csrfToken,
        // redirect_uri must be matched with one of enrolled redirect url in dropbox
        redirect_uri: generateRedirectURI(req)
      }
    }));
  });

  // router to accept what dropbox responsed against user's request for authentication
  route.get('/success', function(req, res) {
    console.log('access /dropbox/success');
    if (req.query.error) {
      return res.send('ERROR ' + req.query.error + ': ' + req.query.error_description);
    }
    if (req.query.state !== req.cookies.csrf) {
      return res.status(401).send(
        'CSRF token mismatch, possible cross-site request forgery attempt.'
      );
    }
    request.post('https://api.dropbox.com/1/oauth2/token', {
      form: {
        code: req.query.code,
        grant_type: 'authorization_code',
        redirect_uri: generateRedirectURI(req)
      },
      auth: {
        user: dropbox_client.getClientId(),
        pass: dropbox_client.getClientSecret()
      }
    },
    function(error, response, body) {
      var data = JSON.parse(body);
      if (data.error) {
        return res.send('ERROR: ' + data.error);
      }
      const USER_ACCESS_TOKEN = data.access_token;
      console.log('[USER TOKEN] ' + USER_ACCESS_TOKEN);

      const sql = '';
      const upsql = '';
      const user_data = {}; // record to be inserted

      console.log('data: ' + data);

      // todo: insert user token into database
      // if there is token already in database, it must be dealt with
      dbutil.pool.executeQuery(function(con) {
        con.query(sql, user_data, function(err, results) {

          // todo

        });
      });

      // req.session.token = data.access_token;
      request.post('https://api.dropbox.com/1/account/info', {
        headers: {
          Authorization: 'Bearer ' + USER_ACCESS_TOKEN
        }
      });
      // final working after all process of authentication without any errors
      res.send('Logged in successfully as ' + JSON.parse(body).access_token + '.');
    });
  });

  return route;
}
