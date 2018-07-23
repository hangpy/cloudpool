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
   var formidable = require('formidable');
   var async = require('async');
   var fs = require('fs');
   var dbxUtil=require('../cpdropbox/dropbox_util.js');
   var googleUtil=require('../cpgoogle/google_util.js');
   var boxUtil=require('../cpbox/box_util.js');

   var dbx_init = require('../cpdropbox/dropbox_init');
   var google_init = require('../cpgoogle/google_init');
   var box_init = require('../cpbox/box_init');
   var knex = require('../db/knex');
   var async = require('async');
   const min = 65536;
   var commonname='';
   var present;
   var totalSize;
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

  var upload = function(FileInfo,size, req, res){

    var FileInfoG = FileInfo.getSync(0);
    var FileInfoD = FileInfo.getSync(1);
    var FileInfoB = FileInfo.getSync(2);
    console.log('uploadSplit:FileInfoG:: '+FileInfoG);
    console.log('uploadSplit:FileInfoD:: '+FileInfoD);
    console.log('uploadSplit:FileInfoB:: '+typeof(FileInfoB));
    var splitedname = FileInfoD.split("\\");
    var temp =splitedname[(splitedname.length)-1];
    var FileName = temp.substring(0,temp.length-4);
    var mimeTemp = temp.split(".");
    var mimeType = mimeTemp[(mimeTemp.length)-2];
    var googlePD;
    async.parallel([
      function(callback){
        google_init(req.user, function(client) {
          var folderID = 'root'
          //var form = new formidable.IncomingForm();
            // form.parse(req, function(err, fields, files) {
            googleUtil.uploadSplit(FileInfoG, folderID, client,function(result){

              callback(null, result);
            });

            //res.redirect('/google/' + folderID);

          // });
        })
      },
      function(callback){
        dbx_init(req.user, function(client){
              dbxUtil.dbx.uploadSplit(client, FileInfoD , '');
              callback(null, temp);
        });


      },
      function(callback){
        box_init(req.user, function(client){
          var FolderID = '0';
            //var form = new formidable.IncomingForm();
            //form.parse(req, function(err, fields, files) {
              var FileInfo = FileInfoB;
              //res.redirect('/' + FolderID);
                //비동기 필요
              boxUtil.uploadSplit(client, FileInfoB, FolderID, function(result){
                callback(null, result);
              });

          //  });
          });
      }
    ],function(err, results){
      console.log(results);
      console.log('userID : '+req.user.userID);
      console.log('FileName: '+ FileName);
      console.log('uploadSplit:FileInfoD:: '+FileInfoD);
      var time = new Date(Date.now())
      knex('SPLIT_FILE_TB').insert({
        userID : req.user.userID,
        fileName: FileName,
        dbxPath: results[1],
        boxID: results[2],
        googlePD: results[0],
        mimeType: mimeType,
        size: size,
        parents: '//',
        modifiedTime : time
      }).then(function(){
        });

    })




  }

//downloads

  var download = function(splitFileID, req, res, callback0){

    var backURL = req.header('Referer') || '/';
    var zippath;

    var dbxPath;
    var boxID;
    var googlePD;

        //fileName = req.body.name;
    //var fileName='1532015476688(M)20180125_주제 탐색1_SJS_마침.pptx';
    console.log("splitFileID : "+splitFileID);
    commonname = splitFileID;
    console.log('test');
    knex.select('*').from('SPLIT_FILE_TB').where('splitFileID', splitFileID)
    .then(function(rows){
      console.log(rows);
      boxID = rows[0].boxID;
      dbxPath = rows[0].dbxPath;
      googlePD = rows[0].googlePD;
      console.log("boxID"+boxID);
      console.log("dbxPath"+dbxPath);
      console.log("googlePD"+googlePD);
    }).catch(function(err){
      console.log("SQL Error");
      console.log(err);
    });



  async.parallel([
      //Dropbox
  function(callback){
      dbx_init(req.user, function(client){
        dbxUtil.dbx.downloadSplit(client, dbxPath, '',req, res, function(dropdownpath){
          console.log('dropdownpath'+dropdownpath);
          var zip = dropdownpath.split(".");
          if(zip[zip.length-1]=='zip'){
            zippath = dropdownpath;
          }
        })
      });

      callback(null,'dropbox complete');
  },
  function(callback){
    //Box
    box_init(req.user, function(client){
      var FileID = boxID;
      if (Array.isArray(FileID)) {
        async.map(FileID, function(id, callback1) {
          boxUtil.downloadSplit(client, boxID, function(filename){
            var zip = filename.split(".");

            if(zip[zip.length-1]=='zip'){
              zippath = filename;
            }
          });
          callback1(null, 'finish');
        });
      } else {
        boxUtil.downloadSplit(client, boxID, function(filename){
          var zip = filename.split(".");

          if(zip[zip.length-1]=='zip'){
            zippath = filename;
          }
        });
      }
    });

    callback(null,'box complete');
  }
  , function(callback){
    //Google
    google_init(req.user, function(client) {
      googleUtil.downloadSplit(googlePD, client, function(filename){
        var zip = filename.split(".");

        if(zip[zip.length-1]=='zip'){
          zippath = filename;
        }
      });
    });

    callback(null,'google complete');
  }
], function(err, results){

  console.log('zippath: '+zippath);

  callback0(zippath);
});



}

var unzip_zip4j = function(zippath, req, res,callback){
  console.log(commonname);
  var file = java.newInstanceSync("java.io.File", "../routes/downloads/dis/"+commonname+".zip");

  var zipFile = java.newInstanceSync("net.lingala.zip4j.core.ZipFile", file.getAbsolutePathSync());

  zipFile.extractAll(__dirname+"/downloads/org/", function(err, result){
    if(err) console.log(err);
    else{
        console.log("Complete unzip : "+zippath);
        var patharr = ["../routes/downloads/dis/"+commonname+".zip","../routes/downloads/dis/"+commonname+".z01","../routes/downloads/dis/"+commonname+".z02"];
        //파일 최종 이름 가져오기
        var separatedfile =  patharr[1].split("/");
        var filename=separatedfile[separatedfile.length-1];
        var timestamp = filename.split('(M)')[0];
        var orgfilename = timestamp+"(M)"+commonname;
        async.map(patharr,
                function(path, callback){
                  //원본파일삭제 patharr[0]은 undefine이라서 예외처리

                    fs.unlink(path, function(err){
                      if(err)throw err;

                      console.log('Successfully deleted downloaded file -> '+path);

                    });


                },
                function(err,result){
                    if(err) console.log(err);
                    //다운로드 완료
                    else {
                      var orgdir=__dirname+"/downloads/org/"+orgfilename;
                      console.log("original file path is " + orgdir);
                      callback(orgdir,orgfilename);
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

var loadData = function(userID, callback){
  //각각 드라이브 DB에서 액세스 토큰 및 파일 리스트 읽어오기
  knex.select('*').from('SPLIT_FILE_TB').where('userID', userID)
  .then(function(rows){

    callback(rows);

  })};

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
