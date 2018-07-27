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

  var sizeSplit = function(size, driveState) {

    var googleCount = driveState[0];
    var dropboxCount = driveState[1];
    var boxCount = driveState[2];
    var sum = googleCount + dropboxCount + boxCount;
    var result;
    console.log('file size : '+ size);


      if (size > min * sum) {
        result = parseInt(size / sum);
        return result;
      } else {
        result = size;
        return result;
    }
   // 최소사이즈 보다 작을시 에러 메세지
  };


  var filesToAdd = java.newInstanceSync("java.util.ArrayList");

  var orgFile = function(dirname, path) {
    return java.newInstanceSync("java.io.File", dirname + "/" + path);
  };

  var zipFileU = function(dirname, filename) {
    return java.newInstanceSync("net.lingala.zip4j.core.ZipFile", dirname + "/uploads/dis/" + filename + ".zip");
  };



  var upload = function(FileInfo, size, driveState, req, res){

    var FileInfoG = FileInfo.getSync(0);
    var FileInfoD = FileInfo.getSync(1);
    var FileInfoB = FileInfo.getSync(2);

    var splitedname = FileInfoD.split("\\");
    var temp =splitedname[(splitedname.length)-1];
    var FileName = temp.substring(0,temp.length-4);
    var mimeTemp = temp.split(".");
    var mimeType = mimeTemp[(mimeTemp.length)-2];
    var googlePD;

    var googleCount = driveState[0];
    var dropboxCount = driveState[1];
    var boxCount = driveState[2];

    async.parallel([
      function(callback){
        if(googleCount!=0){
          google_init(req.user, function(client) {
              var folderID = 'root'
              googleUtil.uploadSplit(FileInfoG, folderID, client, function(result){
              callback(null, result);
            });
          })
        }else{
          callback(null,null);
        }
      },
      function(callback){
        if(dropboxCount != 0){
          dbx_init(req.user, function(client) {
                dbxUtil.uploadSplit(client, FileInfoD , '');
                callback(null, temp);
          });
        }else{
          callback(null,null);
        }
      },
      function(callback){
        if(boxCount != 0){
          box_init(req.user, function(client) {
            var FolderID = '0';
            boxUtil.uploadSplit(client, FileInfoB, FolderID, function(result){
              callback(null, result);
            });
          });
        }else{
          callback(null, null);
        }

      }
    ],function(err, results){
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
    knex.select('*').from('SPLIT_FILE_TB').where('splitFileID', splitFileID)
    .then(function(rows){
      console.log(rows);
      boxID = rows[0].boxID;
      dbxPath = rows[0].dbxPath;
      googlePD = rows[0].googlePD;
    }).catch(function(err){
      console.log("SQL Error");
      console.log(err);
    });


    async.parallel([
        //Dropbox
      function(callback){
          dbx_init(req.user, function(client){
            dbxUtil.downloadSplit(client, dbxPath, '',req, res, function(dropdownpath){
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

var unzip_zip4j = function(splitFileID, zippath, req, res,callback){
  var fileName;

  knex.select('fileName').from('SPLIT_FILE_TB').where('splitFileID', splitFileID)
  .then(function(rows){
    fileName = rows[0].fileName;
  }).catch(function(err){
    console.log("SQL Error");
    console.log(err);
  });

  var file = java.newInstanceSync("java.io.File", "../routes/downloads/dis/"+fileName+".zip");

  var zipFile = java.newInstanceSync("net.lingala.zip4j.core.ZipFile", file.getAbsolutePathSync());

  zipFile.extractAll(__dirname+"/downloads/org/", function(err, result){
    if(err) console.log(err);
    else{
        var patharr = ["../routes/downloads/dis/"+fileName+".zip","../routes/downloads/dis/"+fileName+".z01","../routes/downloads/dis/"+fileName+".z02"];
        //파일 최종 이름 가져오기
        var separatedfile =  patharr[1].split("/");
        var filename=separatedfile[separatedfile.length-1];
        var timestamp = filename.split('(M)')[0];


        var orgfilename = timestamp+"(M)"+fileName;
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
  }).catch(function(err){
    console.log("SQL Error");
    console.log(err);
  });
}

var removeDuplicates = function(arr, callback){
  let unique_array = [];
  var result = [];
  for(let i = 0;i < arr.length; i++){
    if((unique_array.indexOf(arr[i].name) == -1)){
      unique_array.push(arr[i].name);
      result.push(arr[i])
    }
  }
  callback(result);
};

var directory = function(rows, depth, callback_result){
  var childList = [];
  var folderList = [];

  async.map(rows, function(row, callback_list){

    console.log("parent : "+row.parents);

    if(row.parents=="/"&&depth == 1){
      console.log("root : "+row.parents);
      console.log('root push');
      childList.push(row);
      callback_list(null, "finish");
    }else{
      var path = row.parents.split('/');

      if(path[depth-1]==''){
        path[depth-1]='/';
      }

      console.log("depth : "+depth);
      console.log("path.length : "+path.length);
      console.log("path[depth] : "+path[depth]); // a
      console.log("path[depth-1] : "+path[depth-1]); // root

      //root는 depth 1
      if((path.length-1) == depth){
        console.log("condition 1 : "+ (path.length-1 == depth));
        childList.push(row);
        console.log('child push');
        callback_list(null, "finish");
      }else if((path.length-1) > depth){
        console.log("condition 2 : "+ (path.length > depth));
        console.log('path[depth+1] : ' + path[depth+1]);
        console.log('path[depth] : '+  path[depth]);
        var folder = {
          "name" : path[depth],
          "parent" : path[depth-1]
        };
        console.log('folder name : '+folder.name);
        console.log('folder parent : '+folder.parent);
        folderList.push(folder);
        console.log('folder push');
        callback_list(null, "finish");
      }else if((path.legnth-1) < depth||!(path[depth])){
        console.log("condition 3 : " +( (path.legnth-1) < depth || !path[depth]));
        callback_list(null, "finish");
      }
    }
  },
  function(err, result){
    if(err){
      console.log(err);
    } else {
      removeDuplicates(folderList, function(result){
        callback_result(childList, result, depth);
      });
    }
  }
);}



var rename = function(splitFileID, newName){
  //update
  var orgName;
  knex.select().from('SPLIT_FILE_TB').where('splitFileID', splitFileID)
  .then(function(rows){
    orgName = rows[0].fileName;
    var splitedName = orgName.split(".");
    var result = newName+"."+splitedName[splitedName.length-1];

    knex('SPLIT_FILE_TB').where('splitFileID',splitFileID).update('fileName', result).then(function(results){
      console.log('rename result : '+ results);
    });

  }).catch(function(err){
    console.log("SQL Error");
    console.log(err);
  });

}


var checkDrive = function(userID, callback){
  knex.select('*').from('DRIVE_STATE_TB').where('userID',userID).then(function(rows){
    var googleCount = rows[0].googleCount;
    var dropboxCount = rows[0].dropboxCount;
    var boxCount = rows[0].boxCount;
    var result =[];
    result.push(googleCount)
    result.push(dropboxCount)
    result.push(boxCount)
    callback(result);
  }).catch(function(err){
    console.log("SQL Error");
    console.log(err);
  });
}

var move = function(FolderID, target, dest){
    knex('SPLIT_FILE_TB').where('',target).update({
      parents : dest,
      thisKeyIsSkipped : undefined
    }).then(function(rows){
      console.log('rows : '+rows);
    }).catch(function(err){
      console.log("SQL Error");
      console.log(err);
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
    zipFileU : zipFileU,
    rename : rename,
    directory : directory,
    move : move
  }
})();

module.exports = UTIL;
