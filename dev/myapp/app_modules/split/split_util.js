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

   java.classpath.push(path.resolve(__dirname,'zip4j-1.3.2.jar'));
   console.log(__dirname);
   java.classpath.push("./");


const UTIL = (function() {

  var storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, 'uploads/org/') // cb 콜백함수를 통해 전송된 파일 저장 디렉토리 설정
    },
    filename: function(req, file, cb) {
      cb(null, Date.now() + file.originalname) // cb 콜백함수를 통해 전송된 파일 이름 설정
    }
  });

  var upload = multer({
    storage: storage
  }).single('userfile');

  var parameters = (function() {
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
  })();

  var sizeSplit = function(size) {
    if (size > 65536 * 3) {
      result = parseInt(size / 3);
    } else {
      if (size > 65536 * 2) {
        result = parseInt(size / 2);
      } else {
        result = size;
      }
      return result;
    }
  };

  var filesToAdd = java.newInstanceSync("java.util.ArrayList");

  var orgFile = function(dirname, path) {
    return java.newInstanceSync("java.io.File", dirname + "/" + path);
  };

  var zipFile = function(dirname, filename) {
    return java.newInstanceSync("net.lingala.zip4j.core.ZipFile", dirname + "/uploads/dis/" + filename + ".zip");
  };


  return {
    splitUtil: {
      storage: storage,
      upload: upload,
      sizeSplit: sizeSplit,
      files: {
        parameters: parameters,
        filesToAdd: filesToAdd,
        orgFile: orgFile,
        zipFile: zipFile
      }
    }
  }
})();

module.exports = UTIL;
