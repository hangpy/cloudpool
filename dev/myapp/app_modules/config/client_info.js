"use strict";

/**
* @file client
* @author hangbok
*
* @description This module is composed of required information which developrs
* need for using drives' apis.
*
* @return {object}
*/

const path = require('path');
require('dotenv').config({path: path.join(__dirname + '/../../.env')});

module.exports = (function(){
  // Google's developr token
  return {
    GOOGLE: (function(){
      const CLIENT_ID = process.env.GOOGLE_CLIENT_ID,
            CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET,
            REDIRECT_URL = process.env.GOOGLE_REDIRECT_URL;
      return {
        getClientId: function(){
          return CLIENT_ID;
        },
        getClientSecret: function(){
          return CLIENT_SECRET;
        },
        getRedirectUrl: function(){
          return REDIRECT_URL;
        }
      };
    })(),
    // Dropbox's developr token
    DROPBOX: (function(){
      const CLIENT_ID = process.env.DROPBOX_CLIENT_ID;
      const CLIENT_SECRET = process.env.DROPBOX_CLIENT_SECRET;
      const REDIRECT_URL = process.env.DROPBOX_REDIRECT_URL;
      return {
        getClientId: function(){
          return CLIENT_ID;
        },
        getClientSecret: function(){
          return CLIENT_SECRET;
        },
        getRedirectUrl: function(){
          return REDIRECT_URL;
        }
      };
    })(),
    // Box's developr token
    BOX: (function(){
      const CLIENT_ID = process.env.BOX_CLIENT_ID;
      const CLIENT_SECRET = process.env.BOX_CLIENT_SECRET;
      const REDIRECT_URL = process.env.BOX_REDIRECT_URL;
      return {
        getClientId: function(){
          return CLIENT_ID;
        },
        getClientSecret: function(){
          return CLIENT_SECRET;
        },
        getRedirectUrl: function(){
          return REDIRECT_URL;
        }
      };
    })()
  }
})();
