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
         callback(JSON.parse(body));
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
        callback(body);
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


//   var uploadFile = function(FileInfo, Folder,oauth2Client) {
//       var drive = google.drive({
//         version: 'v3',
//         auth: oauth2Client
//       });

//       if (Folder == '\'root\'') {
//         var fileMetadata = {
//           'name': FileInfo.name
//         };
//         var media = {
//           mimeType: FileInfo.type,
//           body: fs.createReadStream(FileInfo.path)
//         };

//         drive.files.create({
//           resource: fileMetadata,
//           media: media,
//           fields: 'id'
//         }, function(err, file) {
//           if (err) {
//             console.error(err);
//           } else {
//             console.log('Uploaded!');
//           }
//         });
//       } else {
//         var FolderID = Folder;
//         // 디렉토리 내에서 업로
//         var fileMetadata = {
//           'name': FileInfo.name,
//           parents: [FolderID]
//         };

//         var media = {
//           mimeType: FileInfo.type,
//           body: fs.createReadStream(FileInfo.path)
//         };

//         drive.files.create({
//           resource: fileMetadata,
//           media: media,
//           fields: 'id'
//         }, function(err, file) {
//           if (err) {
//             console.error(err);
//           } else {
//             console.log('Uploaded!');

//           }
//         });
//       }

//   }

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


//   var updateDir = function(fileId, folderId, oauth2Client) {
//     var fileId;
//     var folderId; // 이동시키려는 folder
//     // var fileId = '1wi6vB5fWXer4T2ULA_0bNNGsl2Ff675g';
//     // var folderId = '1gd2kkvnSjz95WUM9KWePmhDc_BrAdlqq';

//     var drive = google.drive({
//       version: 'v3',
//       auth: oauth2Client
//     });

//     drive.files.get({
//       fileId: fileId,
//       fields: 'parents'
//     }, function(err, file) {
//       if (err) {
//         // Handle error
//         console.error(err);
//       } else {
//         // Move the file to the new folder
//         var previousParents = file.data.parents.join(',');
//         console.log('previous Parents : ', previousParents);
//         drive.files.update({
//           fileId: fileId,
//           addParents: folderId,
//           removeParents: previousParents,
//           fields: 'id, parents'
//         }, function(err, file) {
//           if (err) {
//             // Handle error
//           } else {
//             console.log(file.data);
//             // File moved.
//           }
//         });
//       }
//     });
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



//   var getThumbnailLink = function(fileId,oauth2Client) {
//     var drive = google.drive({
//       version: 'v3',
//       auth: oauth2Client
//     });
//     drive.files.get({
//       fileId: fileId,
//       // fileId: '1gd2kkvnSjz95WUM9KWePmhDc_BrAdlqq',
//       // auth: oauth2Client,// daily 인증 횟수 오류 뜨면 활성화
//       fields: 'thumbnailLink'
//     }, (err, metadata) => {
//       if (err) {
//         console.log('The API returned an error!!!!!!!!!!!!!!!!!!!!: ' + err);
//         console.log('222222!!!!!!!!!!!!!!!!!!!!: ');
//         return;
//       } else {
//         console.log('metadata: ', metadata.data.thumbnailLink);
//       }
//     });
  // }


  return {
    list: list,
    reName:reName,
    deleteFile:deleteFile,
    // downloadFile: downloadFile,
    // uploadFile: uploadFile,
    // deleteFile: deleteFile,
    // updateFile: updateFile,
    // updateDir: updateDir,
    // searchName: searchName,
    searchType: searchType,
    // makeDir: makeDir,
    // copyFile: copyFile,
    // getThumbnailLink: getThumbnailLink
  }
})();
