"use strict";

/**
* @file db_con
* @author hangbok
*
* @description This module has purpose to devide functions related with DB.
* @return {object}
*/

const mysql = require('mysql');
const config = require('../config/db_info');

module.exports = (function(config){

  return {
    /**
    * Call specific function which is suitable for each case out of below functions.
    * - getLocalConfig() -getLocalPoolConfig()
    * - getDevConfig() -getDevPoolConfig()
    * - getTestConfig() -getTestPoolConfig()
    * - getServiceConfig() -getServicePoolConfig()
    * @param {callback}
    *
    */
    init: function(callback){
      callback(mysql.createConnection(config.getLocalConfig()));
    },

    // this method is used for handling connection pool
    initPool: function(callback){
        // console.log(2)
        callback(mysql.createPool(config.getLocalPoolConfig()));
    }
  }
})(config);
