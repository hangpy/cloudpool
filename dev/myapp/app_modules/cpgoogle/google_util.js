var path = require('path'),
  {
    google
  } = require('googleapis'),
  async = require('async'),
  fs = require('fs'),
  request = require('request');


module.exports = (function() {

  var list = function(userId,folderId, orderKey, callback) {
    var data = { "userId" : userId , "folderId" : folderId };
    request.post({
      url: 'http://localhost:4000/api/google/check/',
      body : data,
      json : true
    },
      function(error, response, body){
        if(error){
          console.log('list error');
          callback();
        }
        else{
          callback(JSON.parse(body));
        }
         
      }
    );
  };


var searchType = function(userId,keyWord, keyType, orderKey,callback) {
    var data = { "userId" : userId , "keyWord": keyWord, "keyType" : keyType };
    request.post({
      url: 'http://localhost:4000/api/google/check/',
      body : data,
      json : true
    },
      function(error, response, body){
        if(error){
          console.log('list error');
          callback();
        }
        else{
          callback(body);
        }
      }
    );
};

var reName =function(userId,fileId,folderId,newName, callback){
    var data = { "userId" : userId , "fileId": fileId, "folderId" : folderId, "newName": newName };
    request.post({
      url: 'http://localhost:4000/api/google/rename/',
      body : data,
      json : true
    },
      function(error, response, body){
        callback(body);
      }
    );
}

var deleteFile =function(userId,fileId,callback){
  var data = { "userId" : userId , "fileId": fileId};
  request.post({
    url: 'http://localhost:4000/api/google/delete/',
    body : data,
    json : true
  },
    function(error, response, body){
      callback(body);
    }
  );
}

// var downloadFile = function(res, fileId,oauth2Client) {
//     var drive = google.drive({
//       version: 'v3',
//       auth: oauth2Client
//     });

//     drive.files.get({
//       fileId: fileId,
//       alt: "media"
//     }, (err) => {
//       if (err) {
//         console.log('The API returned an error: ' + err);
//         return;
//       }
//     }).pipe(res);
// }


  var uploadFile = function(userId,FileInfo, Folder,oauth2Client,callback) {
    console.log('upload 함수 시작 ');
      var drive = google.drive({
        version: 'v3',
        auth: oauth2Client
      });

      if (Folder == '\'root\'') {
        var fileMetadata = {
          'name': FileInfo.name
        };
        var media = {
          mimeType: FileInfo.type,
          body: fs.createReadStream(FileInfo.path)
        };

        drive.files.create({
          resource: fileMetadata,
          media: media,
          fields: 'id,name,mimeType,createdTime,modifiedTime,size,parents'
        }, function(err, file) {
          if (err) {
            console.log(err);
          } else {
            console.log('Uploaded!');
            var data = { "userId" : userId , "newFile": file.data};
            console.log(data);

            request.post({
              url: 'http://localhost:4000/api/google/upload/',
              body : data,
              json : true
            },
              function(error, response, body){
                callback(body);
              });
          }
        });
      } else {
        var FolderID = Folder;
        // 디렉토리 내에서 업로
        var fileMetadata = {
          'name': FileInfo.name,
          parents: [FolderID]
        };

        var media = {
          mimeType: FileInfo.type,
          body: fs.createReadStream(FileInfo.path)
        };

        drive.files.create({
          resource: fileMetadata,
          media: media,
          fields: "id,name,mimeType,createdTime,modifiedTime,size,parents",
        }, function(err, file) {
          if (err) {
            console.log(err);
          } else {
            console.log('Uploaded!');
            var data = { "userId" : userId , "newFile": file.data};
            console.log(data);

            request.post({
              url: 'http://localhost:4000/api/google/upload/',
              body : data,
              json : true
            },
              function(error, response, body){
                callback(body);
              });
          }
        });
      }
  }


  
  var getThumbnailLink = function(fileId,oauth2Client,callback) {
    var drive = google.drive({
      version: 'v3',
      auth: oauth2Client
    });
    drive.files.get({
      fileId: fileId,
      fields: 'thumbnailLink'
    }, (err, metadata) => {
      if (err) {
        console.log('The API returned an error!!!!!!!!!!!!!!!!!!!!: ' + err);
        console.log('222222!!!!!!!!!!!!!!!!!!!!: ');
        callback('fail');
      } else {
        callback(metadata.data.thumbnailLink);
      }
    });
  }

  var moveDir = function(userId, fileId, folderId, CurfolderId,callback) {
    var data = { "userId" : userId , "fileId": fileId, "folderId" : folderId,"CurfolderId":CurfolderId};
    request.post({
      url: 'http://localhost:4000/api/google/mvdir/',
      body : data,
      json : true
    },
      function(error, response, body){
        callback(body);
      }
    );
    
  }

  var GetSize= function(oauth2Client,callback){
    var drive = google.drive({ version: 'v3', auth: oauth2Client });
    drive.about.get({
      fields :'storageQuota'
    },function(req, res){
      console.log(res.data.storageQuota);
      callback();
    });
    // "storageQuota": {
    //   "limit": long,
    //   "usage": long,
    //   "usageInDrive": long,
    //   "usageInDriveTrash": long
    // },

  }



var downloadFile = function(res,userId,fileId,oauth2Client) {


   var data = { "userId" : userId , "fileId": fileId};
   request.post({
     url: 'http://localhost:4000/api/google/download/',
     body : data,
     json : true
   },
     function(error, response, body){
      console.log(body);

      var drive = google.drive({
        version: 'v3',
        auth: oauth2Client
      });
      console.log(body.name);
      console.log(body.mimeType);
      var newFileName = encodeURIComponent(body.name);
      res.setHeader('Content-disposition', 'attachment; filename*=UTF-8\'\'' + newFileName); //origFileNm으로 로컬PC에 파일 저장
      res.setHeader('Content-type', body.mimeType);
      runSample(fileId, drive, res);
     }
   );


}
async function runSample (fileId, drive,res) {
  return new Promise(async (resolve, reject) => {
    // const filePath = path.join(os.tmpdir(), uuid.v4());
    console.log(`writing to` );
    // const dest = fs.createWriteStream(filePath);
    let progress = 0;
    const test = await drive.files.get(
      {fileId, alt: 'media'},
      {responseType: 'stream'}
    );
    test.data
      .on('end', () => {
        console.log('Done downloading file.');
        // resolve(filePath);
      })
      .on('error', err => {
        console.error('Error downloading file.');
        reject(err);
      })
      .on('data', d => {
        progress += d.length;
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write(`Downloaded ${progress} bytes`);
      })
      .pipe(res);
  });
 }


//  var downloadFile = function(res, fileId,oauth2Client) {
//   var drive = google.drive({
//     version: ‘v3’,
//     auth: oauth2Client
//   });
//   var newFileName = encodeURIComponent(‘KakaoTalk_Photo_2017-11-29-16-29-41.png’);
//   var fileId= ‘1gSIyRK6PWRGGl0dzS1D4KjMeEVNWzAif’;
//   res.setHeader(‘Content-disposition’, ‘attachment; filename*=UTF-8\‘\’' + newFileName); //origFileNm으로 로컬PC에 파일 저장
//   res.setHeader(‘Content-type’, ‘image/png’);
//   runSample(fileId, drive, res);


// }

// async function runSample (fileId, drive,res) {
// return new Promise(async (resolve, reject) => {
//   // const filePath = path.join(os.tmpdir(), uuid.v4());
//   console.log(`writing to` );
//   // const dest = fs.createWriteStream(filePath);
//   let progress = 0;
//   const test = await drive.files.get(
//     {fileId, alt: ‘media’},
//     {responseType: ‘stream’}
//   );
//   test.data
//     .on(‘end’, () => {
//       console.log(‘Done downloading file.’);
//       // resolve(filePath);
//     })
//     .on(‘error’, err => {
//       console.error(‘Error downloading file.’);
//       reject(err);
//     })
//     .on(‘data’, d => {
//       progress += d.length;
//       process.stdout.clearLine();
//       process.stdout.cursorTo(0);
//       process.stdout.write(`Downloaded ${progress} bytes`);
//     })
//     .pipe(res);
// });
// }

//   var deleteFile = function(fileId,oauth2Client) {
//     var drive = google.drive({
//       version: 'v3',
//       auth: oauth2Client
//     });

//     drive.files.delete({'fileId': fileId});
//   }


//   var updateFile = function(Newname, fileId,oauth2Client) {
//     var drive = google.drive({
//       version: 'v3',
//       auth: oauth2Client
//     });

//     drive.files.update({
//       fileId: fileId,
//       resource: {
//         "name": Newname
//       }
//     }, (err, file) => {
//       if (err) {
//         console.log('The API returned an error: ' + err);
//         return;
//       } else {
//         console.log(file.data);
//       }
//     });

//     console.log("name completely changed!");
//     // res.redirect('google/rootroot);
//   }

//   var searchName = function(Filename,oauth2Client) {
//     var drive = google.drive({
//       version: 'v3',
//       auth: oauth2Client
//     });
//     // var query = "parents in "" and trashed = false ";
//     var query = "name contains '" + Filename + "' and trashed = false ";
//     drive.files.list({
//       q: query,
//       auth: oauth2Client,
//       pageSize: 100,
//       fields: "nextPageToken, files(id,name,mimeType,createdTime,modifiedTime,size,parents)"
//     }, function(err, response) {
//       if (err) {
//         console.log('The API returned an error 1: ' + err);
//         return;
//       } else {
//         console.log(response.data.files);
//       }
//     });
//   }



//   var searchType = function(Filetype,oauth2Client,callback) {
//     var drive = google.drive({
//       version: 'v3',
//       auth: oauth2Client
//     });
//     // var query = "parents in "" and trashed = false ";
//     // var Filetype = application/vnd.google-apps.folder;
//     var query = "mimeType contains '" + Filetype + "' and trashed = false ";
//     drive.files.list({
//       q: query,
//       auth: oauth2Client,
//       pageSize: 100,
//       fields: "nextPageToken, files(id,name,mimeType,createdTime,modifiedTime,size,parents)"
//     }, function(err, response) {
//       if (err) {
//         console.log('The API returned an error (search): ' + err);
//         return;
//       } else {
//         var filelist = [];
//         var _filelist = response.data.files;
//         // console.log('metadata2: ',folder);
//         // filelist.push(folder);
//         async.map(_filelist,
//           function(file, callback_list) {
//             //각각 디렉토리의 파일리스트 읽어오기
//             if (file != undefined) {
//               var fileinfo = {
//                 "id": file.id,
//                 "name": file.name,
//                 "mimeType": file.mimeType,
//                 "modifiedTime": file.modifiedTime,
//                 "size": file.size,
//                 "parents": file.parents
//               };

//               console.log(":", fileinfo)
//               filelist.push(fileinfo);
//               callback_list(null, "finish")
//             } else callback_list(null, "finish");
//           },
//           function(err, result) {
//             if (err) console.log(err);
//             //list 받아오기 완료
//             else {
//               console.log('Finish the File list');
//               // console.log(filelist);
//               callback(filelist);
//               console.log(filelist);
//             }
//           }
//         );
//       }
//     });
//   }



//   var makeDir = function(foldername, FolderID,oauth2Client) {
//     var drive = google.drive({
//       version: 'v3',
//       auth: oauth2Client
//     });
//     var fileMetadata = {
//       'name': foldername,
//       'mimeType': 'application/vnd.google-apps.folder',
//       parents: [FolderID]
//     };
//     drive.files.create({
//       resource: fileMetadata,
//       fields: 'id, parents'
//     }, function(err, file) {
//       if (err) {
//         // Handle error
//         console.error(err);
//       } else {
//         console.log('Folder Id: ', file.data);
//       }
//     });
//   }



//   var copyFile = function(FileID,oauth2Client) {
//     var drive = google.drive({
//       version: 'v3',
//       auth: oauth2Client
//     });
//     drive.files.copy({
//       fileId: FileID
//       // fields: 'id, parents'
//     }, function(err, file) {
//       if (err) {
//         // Handle error
//         console.error(err);
//       } else {
//         console.log('Folder Id: ', file.data);
//       }
//     });
//   }


  return {
    list: list,
    reName:reName,
    deleteFile:deleteFile,
    downloadFile: downloadFile,
    uploadFile: uploadFile,
    moveDir:moveDir,
    // deleteFile: deleteFile,
    // updateFile: updateFile,
    // updateDir: updateDir,
    // searchName: searchName,
    searchType: searchType,
    GetSize:GetSize,
    // makeDir: makeDir,
    // copyFile: copyFile,
    getThumbnailLink: getThumbnailLink
  }
})();
