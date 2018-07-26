"use strict";

/**
 * @file dropbox_util
 * @author ikhwan
 *
 * @description This module is composed of convenient functions of dropbox
 *
 */

var initDropbox = require('./dropbox_init')
  // , dbx
  ,
  usr_session = {},
  path = require('path'),
  fetch = require('isomorphic-fetch'),
  fs = require('fs'),
  https = require('https'),
  async = require('async'),
  request = require('request'),
  mime = require('mime');


const UTIL = (function() {

  // var connection = db_con.init();

  /****************************************************************************
   * @description simplify connection with db pool
   * @param {callback}
   *
   */

  var getlistRest = function(user_id, FolderDir, callback) {
    var user_id = user_id;
    var data = {
      "user_id": user_id,
      "folderID": FolderDir
    };
    request.post({
        url: 'http://localhost:4000/api/dropbox/check/',
        body: data,
        json: true
      },
      function(error, response, body) {
        callback(body);
      }
    );
  }

  //refresh
  var getrefreshRest = function(user_id, FolderDir, callback) {
    // initDropbox(usr_session, function(dbx){
    var data = {
      "user_id": user_id,
      "folderID": FolderDir
    };
    request.post({
        url: 'http://localhost:4000/api/dropbox/refresh/',
        body: data,
        json: true
      },
      function(error, response, body) {
        callback(body);
      }
    );

    // });
  }

  var sendrenameRest = function(user_id, newName, filename, FolderID, callback) {

    // initDropbox(usr_session, function(dbx){
    var user_id = user_id;
    var data = {
      "user_id": user_id,
      "file_name": filename,
      "newName": newName,
      "folderID": FolderID
    };
    request.post({
        url: 'http://localhost:4000/api/dropbox/rename/',
        body: data,
        json: true
      },
      function(error, response, body) {
        callback("finish_rename_the_file");
      }
    );

    // });
  }
  var sendsearchRest = function(user_id, searchname, searchFolder, FolderID, callback) {
    // initDropbox(usr_session, function(dbx){
    var user_id = user_id;
    // var accesstoken = dbx.accessToken;
    var data = {
      "user_id": user_id,
      "searchname": searchname,
      "searchFolder": searchFolder,
      "folderID": FolderID
    };
    request.post({
        url: 'http://localhost:4000/api/dropbox/search/',
        body: data,
        json: true
      },
      function(error, response, body) {
        callback(body);
      }
    );

  }

  var sendsearchtypeRest = function(user_id, selecttype, FolderID, callback) {
    // initDropbox(usr_session, function(dbx){
    var user_id = user_id;
    // var accesstoken = dbx.accessToken;
    var data = {
      "user_id": user_id,
      "folderID": FolderID,
      "selecttype": selecttype
    };
    request.post({
        url: 'http://localhost:4000/api/dropbox/searchtype/',
        body: data,
        json: true
      },
      function(error, response, body) {
        callback(body);
      }
    );

    // });
  }


  var movefileRest = function(user_id, fromFile, toFolder, callback){
    // initDropbox(usr_session, function(dbx){
    var user_id = user_id;
    console.log("==========MOVE=======");
    // var accesstoken = dbx.accessToken;
    var data = {
      "user_id": user_id,
      "fromFile": fromFile,
      "toFolder": toFolder
    };
    request.post({
        url: 'http://localhost:4000/api/dropbox/move/',
        body: data,
        json: true
      },
      function(error, response, body) {
        callback("finish_move_the_file");
      }
    );

    // });
  }

  var makeFolderRest = function(user_id, foldername, callback){
    // initDropbox(usr_session, function(dbx){
    var user_id = user_id;
    console.log("==========makefolder=======");
    // var accesstoken = dbx.accessToken;
    var data = {
      "user_id": user_id,
      "folderDir": foldername
    };
    request.post({
        url: 'http://localhost:4000/api/dropbox/makefolder/',
        body: data,
        json: true
      },
      function(error, response, body) {
        callback("finish_makefolder_the_file");
      }
    );

    // });
  }

  // deletefile
  var deletefile = function(dbx, Filename, FolderDir, userID, callback) {
    // initDropbox(usr_session, function(dbx){
    if (FolderDir == "") {
      var totalDir = "/" + Filename;
    } else {
      var totalDir = FolderDir + "/" + Filename;
    }
    var user_id = userID;
    var data = {
      "user_id": userID,
      "folderID": FolderDir
    };
    dbx.filesDelete({
        path: totalDir
      })
      .then(function(response) {
        //삭제후 알림 필요
        console.log(response);
        callback("refresh");
      })
      .catch(function(err) {
        console.log(err);
      });
    // });

  };

  var downloadfile = function(dbx, Filename, FolderDir, req, res) {
    // initDropbox(usr_session, function(dbx){
    if (FolderDir == "") {
      var totalDir = "/" + Filename;
    } else {
      var totalDir = FolderDir + "/" + Filename;
    }

    var fullname = Filename.split(".");
    var mimetype = mime.getType(fullname[fullname.length - 1]);
    //zo3 같이 분할 파일은 null값
    console.log("totalDir :" + totalDir);
    var URL = dbx.filesGetTemporaryLink({
      path: totalDir
    });
    console.log(mimetype);
    console.log(Filename);
    var newFileName = encodeURIComponent(Filename);
    res.setHeader('Content-disposition', 'attachment; filename*=UTF-8\'\'' + newFileName); //origFileNm으로 로컬PC에 파일 저장
    res.setHeader('Content-type', mimetype);
    URL.then(function(result) {
      https.get(result.link, function(file) {
        file.pipe(res);
      });
    });
  };

    var downloadfileSplit = function(dbx, Filename, FolderDir, req, res, callback){
        // initDropbox(usr_session, function(dbx){
          if(FolderDir==""){
          var totalDir = "/"+Filename;
          }
          else{
            var totalDir = FolderDir+"/"+Filename;
          }
          var dropdownpath;
          var fullname = Filename.split(".");
          var mimetype = 'application/octet-stream';
          // var mimetype = mime.lookup(totalDir);
          //zo3 같이 분할 파일은 null값
          var URL = dbx.filesGetTemporaryLink({path: totalDir});
          console.log('dbx mimetype: '+mimetype);
          console.log('dbx filename:' + Filename);
          var newFileName = encodeURIComponent(Filename);
          // res.setHeader('Content-disposition', 'attachment; filename*=UTF-8\'\''+newFileName); //origFileNm으로 로컬PC에 파일 저장
          // res.setHeader('Content-type', mimetype);
          URL.then(function(result){
            dropdownpath='../routes/downloads/dis/'+Filename;
            var output = fs.createWriteStream(dropdownpath);
            var request = https.get(result.link, function(file) {
              // console.log(URL);
              console.log(output);
              file.pipe(output).on('finish', () => {
              });
          });
          callback(dropdownpath);
        // });

      });
}

  var uploadfile = function(dbx, FileInfo, FolderDir, res) {
    // initDropbox(usr_session, function(dbx){
    //여기서 앞단으로 progress bar 계산을 위한 정보를 보낸다 - 현재는 xhr 생각

    fs.readFile(FileInfo.path, function(err, contents) {
      if (err) {
        console.log('Error: ', err);
      }
      var UploadPath = FolderDir + '/' + FileInfo.name;
      //150MB 미만만 가능
      dbx.filesUpload({
          path: UploadPath,
          contents: contents
        })
        .then(function(response) {
          res.json("success")
          // console.log(response);
        })
        .catch(function(err) {
          console.log("Error : " + err);
        });
});
}
    var uploadfileSplit = function(dbx, FilePath, FolderDir){
          // initDropbox(usr_session, function(dbx){
            //여기서 앞단으로 progress bar 계산을 위한 정보를 보낸다 - 현재는 xhr 생각

            fs.readFile(FilePath, function (err, contents) {
                if (err) {
                  console.log('Error: ', err);
                }
                var splitedname = FilePath.split("\\");
                var UploadPath = FolderDir+'/'+splitedname[(splitedname.length)-1];
                //150MB 미만만 가능
                dbx.filesUpload({ path: UploadPath, contents: contents })
                  .then(function (response) {
                    // console.log(response);
                  })
                  .catch(function (err) {
                    console.log(err);
                  });
              });
            }
    // });

    // // File is bigger than 150 Mb - use filesUploadSession* API
    //     const maxBlob = 8 * 1000 * 1000; // 8Mb - Dropbox JavaScript API suggested max file / chunk size
    //     var workItems = [];
    //
    //     var offset = 0;
    //     while (offset < file.size) {
    //       var chunkSize = Math.min(maxBlob, file.size - offset);
    //       workItems.push(file.slice(offset, offset + chunkSize));
    //       offset += chunkSize;
    //     }
    //
    //     const task = workItems.reduce((acc, blob, idx, items) => {
    //       if (idx == 0) {
    //         // Starting multipart upload of file
    //         return acc.then(function() {
    //           return dbx.filesUploadSessionStart({ close: false, contents: blob})
    //                     .then(response => response.session_id)
    //         });
    //       } else if (idx < items.length-1) {
    //         // Append part to the upload session
    //         return acc.then(function(sessionId) {
    //          var cursor = { session_id: sessionId, offset: idx * maxBlob };
    //          return dbx.filesUploadSessionAppendV2({ cursor: cursor, close: false, contents: blob }).then(() => sessionId);
    //         });
    //       } else {
    //         // Last chunk of data, close session
    //         return acc.then(function(sessionId) {
    //           var cursor = { session_id: sessionId, offset: file.size - blob.size };
    //           var commit = { path: '/' + file.name, mode: 'add', autorename: true, mute: false };
    //           return dbx.filesUploadSessionFinish({ cursor: cursor, commit: commit, contents: blob });
    //         });
    //       }
    //     }, Promise.resolve());
    //
    //     task.then(function(result) {
    //       var results = document.getElementById('results');
    //       results.appendChild(document.createTextNode('File uploaded!'));
    //     }).catch(function(error) {
    //       console.error(error);
    //     });
    //


  var listfile = function(dbx, FolderDir, callback) {
    var filelist = [];
    // initDropbox(usr_session, function(dbx){
    console.log("list");
    console.log("FolderDir : " + FolderDir);
    dbx.filesListFolder({
        path: FolderDir
      }) //list 원하는 경로
      .then(function(response) {
        async.map(response.entries,
          function(file, callback_list) {

            //각각 디렉토리의 파일리스트 읽어오기
            if (file != undefined) {
              console.log(file);
              if (file['.tag'] == 'folder') {
                var extension = 'folder';
              } else {
                var fullname = file.name.split(".");
                var extension = mime.getType(fullname[fullname.length - 1]);
              }
              var fileinfo = {
                "id": file.id,
                "name": file.name,
                "mimeType": extension,
                "modifiedTime": file.server_modified,
                "c_modifiedTime": file.client_modified,
                "size": file.size,
                //no parent id
              };
              filelist.push(fileinfo);
              callback_list(null, "finish")
            } else callback_list(null, "finish");
          },
          function(err, result) {
            if (err) console.log(err);
            //list 받아오기 완료
            else {
              console.log('Finish the File list');
              callback(filelist);
            }
          }
        );
      })
      .catch(function(error) {
        console.error(error);
      });
    // });
  };

  var getThumbnailRest = function(user_id, filepath, callback){
    var user_id = user_id;
    console.log("==========getThumbnailRest=======");
    // var accesstoken = dbx.accessToken;
    var data = {
      "user_id": user_id,
      "filepath": filepath
    };
    request.post({
        url: 'http://localhost:4000/api/dropbox/getThumbnail/',
        body: data,
        json: true
      },
      function(error, body) {

        callback(body.body.entries[0].thumbnail);
      }
    );
  }




  return {

      getlistRest: getlistRest,
      sendrenameRest: sendrenameRest,
      list: listfile,
      delete: deletefile,
      upload: uploadfile,
      uploadSplit: uploadfileSplit,
      download: downloadfile,
      downloadSplit: downloadfileSplit,
      sendsearchRest: sendsearchRest,
      sendsearchtypeRest: sendsearchtypeRest,
      getrefreshRest: getrefreshRest,
      movefileRest : movefileRest,
      makeFolderRest : makeFolderRest,
      getThumbnailRest : getThumbnailRest

  }

})();

module.exports = UTIL;
