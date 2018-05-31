"use strict";

/**
* @file db_util
* @author hangbok
*
* @description This module is composed of convenient functions of database
*
*/

var db_con = require('./db_con');

const UTIL = (function(db_con){

  // var connection = db_con.init();


  // /****************************************************************************
  // * @description transaction regarding only one command with connection pool
  // * @param {string, callback}
  // * @todo make method parameter involve variables which can be manipulated
  // */
  // var getQueryResultFromPool = function(sql_stmt, callback){
  //
  //   // console.log(1)
  //
  //   db_con.initPool(function(pool){
  //     pool.getConnection(function(err, connection){
  //       // console.log(3)
  //       connection.query(sql_stmt, function(err, rows, fields){
  //         if(err){
  //           connection.release();
  //           throw err;
  //         }
  //         callback(rows, fields);
  //         connection.release();
  //       });
  //     });
  //   });
  // }

  /****************************************************************************
  * @description simplify connection with db pool
  * @param {callback}
  *
  */

  // work with connection in callback
  var executeQueryFromPool = function(callback){

    db_con.initPool(function(pool){
      pool.getConnection(function(err, con){
        if(err){
          throw err;
          console.error(err);
        } else {
          callback(con);
        }
      });
    });
  }


  /****************************************************************************
  * @description transaction regarding only one command with general connection
  * @param {array, callback}
  */
  var getTransactionFromPool = function(sql_stmts, callback){

  }


  // /****************************************************************************
  // * @description
  // * @param {string, callback}
  // * @todo make method parameter involve variables which can be manipulated
  // */
  // var getQueryResultFromConn = function(sql_stmt, callback){
  //   var connection = db_con.init();
  //   connection.connect();
  //   connection.query(sql_stmt, function(err, rows, fields){
  //     if(err){
  //       console.error('Error while performing query: ' + err);
  //       connection.end();
  //     } else {
  //       callback(rows);
  //       connection.end();
  //     }
  //   });
  // }

  var executeQueryFromConn = function(callback){

    db_con.init(function(connection){
      connection.getConnection(function(err, con){
        if(err){
          throw err;
          console.error(err);
        } else {
          callback(con);
        }
      });
    });
  }


  /****************************************************************************
  * @description
  * @param {array, callback}
  */
  var getTransactionFromConn = function(sql_stmts, callback){

  }

  /****************************************************************************
  * Test whether it works well or not
  *
  * @param {object}
  * parameter is configured by above function init(), which is connection object
  * this is not adapted to pool
  */
  var testConnection = function(con){
    con.connect(function(err){
      if(err){
        console.error('mysql connection error: ' + err);
      } else {
        console.info('mysql is connected successfully!');
      }
    });
  }


  return {
    pool: {
      executeQuery: executeQueryFromPool,
      getTransactionResult: getTransactionFromPool
    },
    conn: {
      executeQuery: executeQueryFromConn,
      getTransactionResult: getTransactionFromConn
    },
    testConnection: testConnection
  }

})(db_con);

module.exports = UTIL;
