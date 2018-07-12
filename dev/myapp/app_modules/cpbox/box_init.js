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

module.exports = function(usr_session, callback){

  const box_client = client_info.BOX;

  const CLIENT_ID = box_client.getClientId(),
        CLIENT_SECRET = box_client.getClientSecret();

  var sdk = new BoxSDK({
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET
  });

  knex.selec


  // 로그인 사용자 정보에 따른 토큰 구별
  dbutil.pool.executeQuery(function(con){
    con.query('select * from user_token', function(err, result, fields){
      if(err){
        con.release();
        throw err;
      } else {
        // const USER_ACCESS_TOKEN = result[0].access_token;
        const USER_ACCESS_TOKEN = '';
        var client = sdk.getBasicClient(USER_ACCESS_TOKEN);
        callback(client);
        con.release();
      }
    });
  });
}
