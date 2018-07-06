var path = require('path')
, {google} = require('googleapis')
, async = require('async')
, fs = require('fs')
, initGoogle = require('./google_init')

module.exports.list = function(FolderID,orderkey, callback){

var usr_session = null;


function listFiles(oauth2Client) {
  var folder = FolderID;
  console.log("getGlist_final's folder id is "+folder);
  var service = google.drive('v3');
  DirFiles(service,oauth2Client,folder);
}

//승엽 파일 리스트
function DirFiles(service,oauth2Client,folder){
  console.log('folderid : ', folder);
  var folderID = '\''+folder+'\'';
  var query = "parents in "+folderID+" and trashed = false ";
  console.log('quary : ', query);
 // var query = "parents in "+'\'root\''+" and trashed = false "
  service.files.list({
    q: query,
    orderBy:orderkey, // arrange order
    auth: oauth2Client,
    pageSize: 100,
    fields: "nextPageToken, files(id,name,mimeType,createdTime,modifiedTime,size,parents)"
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error 1: ' + err);
      return;
    }
    else{
        console.log("DirFiles forder id : ",folder)

      var filelist = [];

      if(folder!='root'){
        console.log('GET ID : ',folder);
        service.files.get({
          fileId: folder,
          // fileId: '1gd2kkvnSjz95WUM9KWePmhDc_BrAdlqq',
          auth: oauth2Client,
          fields:'parents'
        }, (err, metadata) => {
          if (err) {
            console.log('The API returned an error!!!!!!!!!!!!!!!!!!!!: ' + err);
            console.log('222222!!!!!!!!!!!!!!!!!!!!: ');
            return;
          }
          else{
            var _filelist = response.data.files;
            console.log('metadata: ',metadata.data.parents);
            filelist.push(metadata.data.parents);

            async.map(_filelist,
              function(file, callback_list){
                //각각 디렉토리의 파일리스트 읽어오기
                if(file!=undefined){
                var fileinfo={
                  "id" : file.id,
                  "name" : file.name,
                  "mimeType" : file.mimeType,
                  "modifiedTime" : file.modifiedTime,
                  "size" : file.size,
                  "parents" : file.parents
                };

                console.log(":",fileinfo)
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
                    // console.log(filelist);
                    callback(filelist);
                    console.log(filelist);
                  }
              }
            );
          }
        });
      }
      else{
        var _filelist = response.data.files;
        console.log('metadata2: ',folder);
        filelist.push(folder);
        async.map(_filelist,
          function(file, callback_list){
            //각각 디렉토리의 파일리스트 읽어오기
            if(file!=undefined){
            var fileinfo={
              "id" : file.id,
              "name" : file.name,
              "mimeType" : file.mimeType,
              "modifiedTime" : file.modifiedTime,
              "size" : file.size,
              "parents" : file.parents
            };
            
            console.log(":",fileinfo)
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
                // console.log(filelist);
                callback(filelist);
                console.log(filelist);
              }
          }
        );
      }

    }
  });
}

  initGoogle(usr_session, function(oauth2Client){

    listFiles(oauth2Client);

  });
};

module.exports.download = function(res,fileId){
      function download (drive,fileId) {
        drive.files.get({
          fileId: fileId,
          alt: "media"
        }, (err) => {
          if (err) {
            console.log('The API returned an error: ' + err);
            return;
          }
        }).pipe(res);
      }
    var usr_session = null;

    initGoogle(usr_session, function(oauth2Client){
      var drive = google.drive({version : 'v3', auth: oauth2Client });
      download(drive,fileId);
      });
}

module.exports.upload = function(FileInfo, Folder){
  var usr_session = null;
  initGoogle(usr_session, function(oauth2Client){
    var drive = google.drive({version : 'v3', auth: oauth2Client });
    if(Folder=='\'root\''){
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
                  fields: 'id'
                }, function (err, file) {
                  if (err) {
                    console.error(err);
                  } else {
                    console.log('Uploaded!');

                  }
              });
      }else{
        var FolderID = Folder;
        // 디렉토리 내에서 업로
            var fileMetadata = {
              'name': FileInfo.name,
              parents:[FolderID]
            };

            var media = {
              mimeType: FileInfo.type,
              body: fs.createReadStream(FileInfo.path)
            };

            drive.files.create({
                  resource: fileMetadata,
                  media: media,
                  fields: 'id'
                }, function (err, file) {
                  if (err) {
                    console.error(err);
                  } else {
                    console.log('Uploaded!');

                  }
              });
      }



    });


}

module.exports.delete = function(fileId){
  var usr_session = null;
  initGoogle(usr_session, function(oauth2Client){
    var drive = google.drive({version : 'v3', auth: oauth2Client });

    function deletefile (fileId) {
      var request = drive.files.delete({
          'fileId': fileId
        });

    }
    deletefile(fileId);
  });
}

module.exports.updatefile = function(Newname,fileId){
  var usr_session = null;
  initGoogle(usr_session, function(oauth2Client){
    var drive = google.drive({version : 'v3', auth: oauth2Client });

    drive.files.update({
      fileId: fileId,
      resource : {
        "name": Newname
      }
    }, (err,file) => {
      if (err) {
        console.log('The API returned an error: ' + err);
        return;
      }
      else{
        console.log(file.data);
      }
    });
  });
  //res.redirect('google/'root);
}
  
module.exports.updatefile = function(Newname,fileId){
  var usr_session = null;
  initGoogle(usr_session, function(oauth2Client){
    var drive = google.drive({version : 'v3', auth: oauth2Client });

    drive.files.update({
      fileId: fileId,
      resource : {
        "name": Newname
      }
    }, (err,file) => {
      if (err) {
        console.log('The API returned an error: ' + err);
        return;
      }
      else{
        console.log(file.data);
      }
    });
  });
  //res.redirect('google/'root);
}

module.exports.updatedir = function(fileId,folderId){
  var usr_session = null;
  
  initGoogle(usr_session, function(oauth2Client){
    var fileId ;
    var folderId ; // 이동시키려는 folder 
    // var fileId = '1wi6vB5fWXer4T2ULA_0bNNGsl2Ff675g';
    // var folderId = '1gd2kkvnSjz95WUM9KWePmhDc_BrAdlqq';
  
    var drive = google.drive({version : 'v3', auth: oauth2Client });
    
    drive.files.get({
      fileId: fileId,
      fields: 'parents'
    }, function (err, file) {
      if (err) {
        // Handle error
        console.error(err);
      } else {
        // Move the file to the new folder
        var previousParents = file.data.parents.join(',');
        console.log('previous Parents : ',previousParents);
        drive.files.update({
          fileId: fileId,
          addParents: folderId,
          removeParents: previousParents,
          fields: 'id, parents'
        }, function (err, file) {
          if (err) {
            // Handle error
          } else {
            console.log(file.data);
            // File moved.
          }
        });
      }
    });
  });
    //res.redirect('google/'root);
}

module.exports.searchname = function(Filename){
  var usr_session = null;
  
    initGoogle(usr_session, function(oauth2Client){
      var drive = google.drive({version : 'v3', auth: oauth2Client });
      // var query = "parents in "" and trashed = false ";
      var query = "name contains '"+Filename+"' and trashed = false ";
      drive.files.list({
        q: query,
        auth: oauth2Client,
        pageSize: 100,
        fields: "nextPageToken, files(id,name,mimeType,createdTime,modifiedTime,size,parents)"
      }, function(err, response) {
        if (err) {
          console.log('The API returned an error 1: ' + err);
          return;
        }
        else{
          console.log(response.data.files);
        }
      });

      //res.redirect('google/'root);
  });
}


module.exports.searchtype = function(Filetype){
  var usr_session = null;

    initGoogle(usr_session, function(oauth2Client){
      var drive = google.drive({version : 'v3', auth: oauth2Client });
      // var query = "parents in "" and trashed = false ";
      // var Filetype = application/vnd.google-apps.folder;
      var query = "mimeType contains '"+Filetype+"' and trashed = false ";
      drive.files.list({
        q: query,
        auth: oauth2Client,
        pageSize: 100,
        fields: "nextPageToken, files(id,name,mimeType,createdTime,modifiedTime,size,parents)"
      }, function(err, response) {
        if (err) {
          console.log('The API returned an error 1: ' + err);
          return;
        }
        else{
          console.log(response.data.files);
        }
      });

      //res.redirect('google/'root);
  });
}

module.exports.makedir = function(foldername,FolderID){
    var usr_session = null;
    
    initGoogle(usr_session, function(oauth2Client){
    var drive = google.drive({version : 'v3', auth: oauth2Client });
    var fileMetadata = {
      'name': foldername,
      'mimeType': 'application/vnd.google-apps.folder',
      parents:[FolderID]
    };
    drive.files.create({
      resource: fileMetadata,
      fields: 'id, parents'
    }, function (err, file) {
      if (err) {
        // Handle error
        console.error(err);
      } else {
        console.log('Folder Id: ', file.data);
      }
    });
    //res.redirect('google/'root);
  });
}

module.exports.copy = function(FileID){
  var usr_session = null;

  initGoogle(usr_session, function(oauth2Client){
    var drive = google.drive({version : 'v3', auth: oauth2Client });
    drive.files.copy({
      fileId: FileID
      // fields: 'id, parents'
    }, function (err, file) {
      if (err) {
        // Handle error
        console.error(err);
      } else {
        console.log('Folder Id: ', file.data);
      }
    });
  //res.redirect('google/'root);
  });
}


module.exports.getthumbnailLink = function(fileId){
  var usr_session = null;

  initGoogle(usr_session, function(oauth2Client){
    var drive = google.drive({version : 'v3', auth: oauth2Client });
    drive.files.get({
      fileId: fileId,
      // fileId: '1gd2kkvnSjz95WUM9KWePmhDc_BrAdlqq',
      // auth: oauth2Client,// daily 인증 횟수 오류 뜨면 활성화 
      fields:'thumbnailLink'
    }, (err, metadata) => {
      if (err) {
        console.log('The API returned an error!!!!!!!!!!!!!!!!!!!!: ' + err);
        console.log('222222!!!!!!!!!!!!!!!!!!!!: ');
        return;
      }
      else{
        console.log('metadata: ',metadata.data.thumbnailLink);
      }
    });
  });
  //res.redirect('google/'root);
}


// module.exports.updatedir = function(fileId,folderId){
  // var usr_session = null;

  // initGoogle(usr_session, function(oauth2Client){
  // }
//   //res.redirect('google/'root);
// }