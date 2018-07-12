"use strict";

/**
* @file box_init
* @author hangbok
*
* @description This module is for simplifying process using box api util
*
* @param {object, callback}
*/


const fs = require('fs');
const BoxSDK = require('box-node-sdk');
const http = require('https');
const mysql = require('mysql');
const dbutil = require('../db/db_util');
const client_info = require('../config/client_info');
const knex = require('../db/knex');

module.exports = function(user_session, callback){

  const box_client = client_info.BOX;

  const CLIENT_ID = box_client.getClientId(),
        CLIENT_SECRET = box_client.getClientSecret();

  var sdk = new BoxSDK({
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET
  });

  knex.select('accessToken_b').from('BOX_CONNECT_TB').where('userID', user_session.userID)
  .then(function(rows){
    const USER_ACCESS_TOKEN = rows[0].accessToken_b;
    var client = sdk.getBasicClient(USER_ACCESS_TOKEN);
    callback(client);
  })
  .catch(function(err){
    console.log(err);
  });
}
