
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
, usr_session = {}
, path = require('path')
, fetch = require('isomorphic-fetch')
, fs = require('fs')
, https = require('https')
, async = require('async')
, mime = require('mime');


const UTIL = (function(){

  // var connection = db_con.init();

  /****************************************************************************
  * @description simplify connection with db pool
  * @param {callback}
  *
  */

  // deletefile
  var deletefile = function(Filename, FolderDir){
      initDropbox(usr_session, function(dbx){
        if(FolderDir==""){
        var totalDir = "/"+Filename;
        }
        else{
          var totalDir = FolderDir+"/"+Filename;
        }

        dbx.filesDelete({ path: totalDir})
          .then(function (response) {
            //삭제후 알림 필요
            console.log(response);
          })
          .catch(function (err) {
            console.log(err);
          });
      });

  };

  var downloadfile = function(Filename, FolderDir, req, res){
      initDropbox(usr_session, function(dbx){
        if(FolderDir==""){
        var totalDir = "/"+Filename;
        }
        else{
          var totalDir = FolderDir+"/"+Filename;
        }

        var fullname = Filename.split(".");
        var mimetype = mime.getType(fullname[fullname.length-1]);
        // var mimetype = mime.lookup(totalDir);
        //zo3 같이 분할 파일은 null값
        var URL = dbx.filesGetTemporaryLink({path: totalDir});
        console.log(mimetype);
        console.log(Filename);
        var newFileName = encodeURIComponent(Filename);
        res.setHeader('Content-disposition', 'attachment; filename*=UTF-8\'\''+newFileName); //origFileNm으로 로컬PC에 파일 저장
        res.setHeader('Content-type', mimetype);
        URL.then(function(result){
          https.get(result.link, function(file) {
            // console.log(URL);
            console.log(res);
            file.pipe(res);
                  // .on('finish', () => {
                  //   res.redirect('/'+FolderID)
                  // }
                  // );
          });
        });
      });

    };

  var uploadfile = function(FileInfo, FolderDir){
    initDropbox(usr_session, function(dbx){
      fs.readFile(FileInfo.path, function (err, contents) {
          if (err) {
            console.log('Error: ', err);
          }
          var UploadPath = FolderDir+'/'+FileInfo.name;

          dbx.filesUpload({ path: UploadPath, contents: contents })
            .then(function (response) {
              console.log(response);
            })
            .catch(function (err) {
              console.log(err);
            });
        });
    });

  };

  var listfile = function(FolderDir, callback){
    var filelist=[];
    initDropbox(usr_session, function(dbx){
      console.log("list");
      dbx.filesListFolder({path :FolderDir}) //list 원하는 경로
      .then(function(response) {
        async.map(response.entries,
          function(file, callback_list){

            //각각 디렉토리의 파일리스트 읽어오기
            if(file!=undefined){
              if(file['.tag']=='folder'){
                var extension = 'folder';
              }
              else{
                var fullname = file.name.split(".");
                var extension = mime.getType(fullname[fullname.length-1]);
              }
            var fileinfo={
              "id" : file.id,
              "name" : file.name,
              "mimeType" : extension,
              "modifiedTime" : file.server_modified,
              "c_modifiedTime" : file.client_modified,
              "size" : file.size,
              //no parent id
            };
            filelist.push(fileinfo);
            callback_list(null,"finish")
          }
            else callback_list(null,"finish");
          },
          function(err,result){
              if(err) console.log(err);
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
    });
  };





  return {
    dbx: {
      list: listfile,
      delete: deletefile,
      upload: uploadfile,
      download: downloadfile
    }
  }

})();

module.exports = UTIL;
