"use strict";

/**
* @file databases
* @author hangbok
*
* @description This module is composed of required information for handling DB
*
* @return {object}
*/
const path = require('path');
require('dotenv').config({path: path.join(__dirname + '/../../.env')});

module.exports = (function(){
  const LOCAL_POOL = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    connectionLimit: 20,
    waitForConnections: false
  };
  const DEV_POOL = {
    host: '',
    port: '',
    user: '',
    password: '',
    database: '',
    connectionLimit: 50,
    waitForConnections: false
  };
  const TEST_POOL = {
    host: '',
    port: '',
    user: '',
    password: '',
    database: '',
    connectionLimit: 50,
    waitForConnections: true
  };
  const SERVICE_POOL = {
    host: '',
    port: '',
    user: '',
    password: '',
    database: '',
    connectionLimit: 200,
    waitForConnections: true
  };
  const LOCAL = {
    host: '',
    port: '',
    user: '',
    password: '',
    database: ''
  };
  const DEV = {
    host: '',
    port: '',
    user: '',
    password: '',
    database: ''
  };
  const TEST = {
    host: '',
    port: '',
    user: '',
    password: '',
    database: ''
  };
  const SERVICE = {
    host: '',
    port: '',
    user: '',
    password: '',
    database: ''
  };

  return {
    getLocalConfig: function(){
      return LOCAL;
    },

    getLocalPoolConfig: function(){
      return LOCAL_POOL;
    },

    getDevConfig: function(){
      return DEV;
    },

    getDevPoolConfig: function(){
      return DEV_POOL;
    },

    getTestConfig: function(){
      return TEST;
    },

    getTestPoolConfig: function(){
      return TEST_POOL;
    },

    getServiceConfig: function(){
      return SERVICE;
    },

    getServicPooleConfig: function(){
      return SERVICE_POOL;
    }
  }
})();
