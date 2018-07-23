"use strict";

/**
 * @file split_util
 * @author Junsung
 *
 * @description This module is composed of convenient functions of File split & upload
 *
 */

   var multer = require('multer');
   var java = require('java');
   var path = require('path');
   var dbxUtil=require('../cpdropbox/dropbox_util.js');
   var googleUtil=require('../cpgoogle/google_util.js');
   var boxUtil=require('../cpbox/box_util.js');
   const min = 65536;
   java.classpath.push(path.resolve(__dirname,'zip4j-1.3.2.jar'));
   console.log(__dirname);
   java.classpath.push("./");


const UTIL = (function() {

  var storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, '../app_modules/split/uploads/org/') // cb 콜백함수를 통해 전송된 파일 저장 디렉토리 설정
    },
    filename: function(req, file, cb) {
      cb(null, file.originalname) // cb 콜백함수를 통해 전송된 파일 이름 설정
    }
  });

  var parameters = function() {
    var result = java.newInstanceSync("net.lingala.zip4j.model.ZipParameters");
    result.setCompressionMethod(8, function(err, res) {
      if (err) {
        console.log(err);
      }
    });
    result.setCompressionLevel(5, function(err, res) {
      if (err) {
        console.log(err);
      }
    });

    return result;
  };

  var sizeSplit = function(size) {
    var result;
    console.log('file size : '+ size);
    if (size > min * 3) {
      result = parseInt(size / 3);
      return result;
    } else {
      if (size > min * 2) {
        result = parseInt(size / 2);
        return result;
      } else {
        result = size;
        return result;
      }
    }
  };


  var filesToAdd = java.newInstanceSync("java.util.ArrayList");

  var orgFile = function(dirname, path) {
    return java.newInstanceSync("java.io.File", dirname + "/" + path);
  };

  var zipFile = function(dirname, filename) {
    return java.newInstanceSync("net.lingala.zip4j.core.ZipFile", dirname + "/uploads/dis/" + filename + ".zip");
  };

  var refreshSpace = function(){
    dbxUil.checkSpace();
  }

  var upload = function(FileInfo){
    console.log(FileInfo.getSync(0));
    googleUtil.uploadSplit(FileInfo.getSync(0) , 'root');
    dbxUtil.dbx.uploadSplit(FileInfo.getSync(1) , '');
    boxUtil.uploadSplit(FileInfo.getSync(2) , '0');
  }

  return {
    storage: storage,
    upload: upload,
    sizeSplit: sizeSplit,
    parameters: parameters,
    filesToAdd: filesToAdd,
    orgFile: orgFile,
    zipFile: zipFile
  }
})();

module.exports = UTIL;
