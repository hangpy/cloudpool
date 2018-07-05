"use strict";

/**
* @file db_util
* @author hangbok
*
* @description This module is composed of convenient functions of database
*
*/

var db_con = require('./db_con');

const UTIL = ( function() {

  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/org/') // cb 콜백함수를 통해 전송된 파일 저장 디렉토리 설정
    },
    filename: function (req, file, cb) {
      cb(null, Date.now()+file.originalname) // cb 콜백함수를 통해 전송된 파일 이름 설정
    }
  });

  var upload = multer({ storage: storage }).single('userfile');


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

}
)();

module.exports = UTIL;
