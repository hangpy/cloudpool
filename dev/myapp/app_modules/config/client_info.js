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


module.exports = (function(){
  // Google's developr token
  return {
    GOOGLE: (function(){
      const CLIENT_ID = '',
            CLIENT_SECRET = '',
            REDIRECT_URL = 'http://localhost:3000/google/callback';
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
      const CLIENT_ID = '';
      const CLIENT_SECRET = '';
      const REDIRECT_URL = '';
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
      const CLIENT_ID = '';
      const CLIENT_SECRET = '';
      const REDIRECT_URL = '';
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
