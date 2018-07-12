'use strict';

/**
 * @file dropbox_auth - router
 * @author hangbok
 *
 * @description This file is router to authenticate user's dropbox drive
 *
 */

module.exports = function() {

  const dbutil = require('../db/db_util');
  const crypto = require('crypto');
  const url = require('url');
  const app = require('express')();

  // generate URI based on path current app is working
  function generateRedirectURI(req) {
    return url.format({
      protocol: req.protocol,
      host: req.headers.host,
      pathname: app.path() + '/dropbox/callback'
    });
  }

  // generate token to protect CSRF attack
  function generateCSRFToken() {
    return crypto.randomBytes(18).toString('base64')
      .replace('///g', '-').replace('/+/g', '_');
  }

  return {
    generateRedirectURI: generateRedirectURI,
    generateCSRFToken: generateCSRFToken
  };
}
