"use strict";

/**
* @file dropbox_init
* @author hangbok
*
* @description This module is for simplifying process using dropbox api util
* @param {object, callback}
*/

// require('isomorphic-fetch');
const Dropbox = require('dropbox').Dropbox;
const knex = require('../db/knex');

module.exports = function(user_session, callback){

  knex.select('accessToken_d').from('DROPBOX_CONNECT_TB').where('userID', user_session.userID)
  .then(function(rows){
    const USER_ACCESS_TOKEN = rows[0].accessToken_d;
    var client = new Dropbox({ accessToken: USER_ACCESS_TOKEN });
    callback(client);
  })
  .catch(function(err){
    console.log(err);
  });
}
