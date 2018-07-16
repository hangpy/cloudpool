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
   var async = require('async');
   const min = 65536;
   var commonname='';
   var present;
   java.classpath.push(path.resolve(__dirname,'zip4j-1.3.2.jar'));
   console.log(__dirname);
   java.classpath.push("./");


const UTIL = (function() {

  var storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, '../app_modules/split/uploads/org/') // cb 콜백함수를 통해 전송된 파일 저장 디렉토리 설정
    },
    filename: function(req, file, cb) {
        present = new Date();
      cb(null,  present.getTime()+'(M)'+file.originalname) // cb 콜백함수를 통해 전송된 파일 이름 설정
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

  var zipFileU = function(dirname, filename) {
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

//downloads

  var download = function(Filename, FolderDir, req, res, callback){

    var backURL = req.header('Referer') || '/';
    fileId = req.body.name;
    console.log('fileId : '+fileId);


    //Dropbox
    dbxUil.dbx.downloadSplit(Filename, FolderDir, req, res, function(dropdownpath){
      var zip = dropdownpath.split(".");
      if(zip[zip.length-1]=='zip'){
        zippath = filename;
      }
    });

    //Box
    if(Array.isArray(fileId)) {
      async.map(fileId, function(id, callback){
        box_util.downloadSplit(id, function(filename){
          var zip = filename.split(".");

          if(zip[zip.length-1]=='zip'){
            zippath = filename;
          }
        });
      });
    }
    else {
      box_util.downloadSplit(fileId, function(filename){
        var zip = filename.split(".");

        if(zip[zip.length-1]=='zip'){
          zippath = filename;
        }
      });
    }
    //Google
    googleUtil.download(fileId, function(filename){
      var zip = filename.split(".");

      if(zip[zip.length-1]=='zip'){
        zippath = filename;
      }
    });

    callback(zippath);
  }

var unzip_zip4j = function(zippath, req, res){

  var file = java.newInstanceSync("java.io.File", zippath.toString());

  var zipFile = java.newInstanceSync("net.lingala.zip4j.core.ZipFile", file.getAbsolutePathSync());

  zipFile.extractAll(__dirname+"/downloads/org/", function(err, result){
    if(err) console.log(err);
    else{
        console.log("Complete unzip : "+zippath);
        var patharr = totalpath.split(",M,");
        //파일 최종 이름 가져오기
        var separatedfile =  patharr[1].split("/");
        var filename=separatedfile[separatedfile.length-1];
        var timestamp = filename.split('(M)')[0];
        var orgfilename = timestamp+"(M)"+commonname;
        async.map(patharr,
                function(path, callback){
                  //원본파일삭제 patharr[0]은 undefine이라서 예외처리
                  if(path!=patharr[0]){
                    fs.unlink(path, function(err){
                      if(err)throw err;

                      console.log('Successfully deleted downloaded file -> '+path);

                    });
                  }

                },
                function(err,result){
                    if(err) console.log(err);
                    //다운로드 완료
                    else {
                      var orgdir=__dirname+"/downloads/org/"+orgfilename;
                      console.log("original file path is " + orgdir);

                      sendfile(orgdir, orgfilename, req, res);

                    }
                }
              );

    }
  });
};

var sendfile = function(orgdir, orgfilename, req, res){

  var file = orgdir;
  //원본파일삭제
  res.download(file, function(){
    fs.unlink(file);
  });
}

var loadData = function(user_id, file_id, req, res){
  //각각 드라이브 DB에서 액세스 토큰 및 파일 리스트 읽어오기

  var search_sql = 'SELECT splitFileID, fileName, dbxPath, boxID, googlePD FROM SPLIT_FILE_TB WHERE user';
  conn.query(search_sql,[user_id, file_id],
    function(err, result){
      if(err){
        console.log(err);
        //이전페이지로 돌아간다.
      }
      else{

        var D_accesstoken = result[0].Daccess;
        Glist = result[0].Gpath.toString().split(",");
        Blist = result[0].Bpath.toString().split(",");
        Dlist = result[0].Dpath.toString().split(",");
        commonname = result[0].filename;
      }
    });
  }

  return {
    storage: storage,
    upload: upload,
    loadData : loadData,
    unzip_zip4j : unzip_zip4j,
    download : download,
    sizeSplit: sizeSplit,
    parameters: parameters,
    filesToAdd: filesToAdd,
    orgFile: orgFile,
    zipFileU : zipFileU
  }
})();

module.exports = UTIL;
