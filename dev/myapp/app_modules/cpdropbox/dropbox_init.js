"use strict";

/**
* @file dropbox_init
* @author hangbok
*
* @description This module is for simplifying process using dropbox api util
* @param {object, callback}
*/

// require('isomorphic-fetch');
var Dropbox = require('dropbox').Dropbox;
var dbutil = require('../db/db_util');

module.exports = function(usr_session, callback){



  dbutil.pool.executeQuery(function(con){
    con.query('select * from user_token', function(err, result, fields){

      if(err){
        con.release();
        throw err;
      } else {
        // var usr_access_token = result[0].Daccess;
        var usr_access_token = '6ngTh0Zf4tAAAAAAAAAAXphlga6-SkdmkN0uKEIerD2LDch3tfU7ge4gmfn5Er2h';
        var dbx = new Dropbox({ accessToken: usr_access_token });

        // dropbox api's util functions will be executed in this callback function
        callback(dbx);
        con.release();
      }
    });
  });

}
