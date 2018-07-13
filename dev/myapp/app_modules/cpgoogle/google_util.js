var path = require('path'),
  {
    google
  } = require('googleapis'),
  async = require('async'),
  fs = require('fs'),
  initGoogle = require('./google_init')

module.exports.list = function(FolderID, callback) {
  var filelist = [];

  var usr_session = null;


  function listFiles(oauth2Client) {
    var folder = FolderID;
    console.log("getGlist_final's folder id is" + folder);
    var service = google.drive('v3');
    DirFiles(service, oauth2Client, folder);
  }

  //승엽 파일 리스트
  function DirFiles(service, oauth2Client, folder) {

    var query = "parents in " + folder + " and trashed = false "
    // var query = "parents in "+'\'root\''+" and trashed = false "
    service.files.list({
      q: query,
      auth: oauth2Client,
      pageSize: 100,
      fields: "nextPageToken, files(id,name,mimeType,createdTime,modifiedTime,size,parents)"
    }, function(err, response) {
      if (err) {
        console.log('The API returned an error: ' + err);
        return;
      } else {
        // filelist가 있을 때와 없을 때
        if (response.data.files == undefined) {
          console.log('there is noting ...');
        } else {
          var _filelist = response.data.files;
          console.log('file lenght : ');
          console.log(_filelist.length);
          async.map(_filelist,
            function(file, callback_list) {
              //각각 디렉토리의 파일리스트 읽어오기
              if (file != undefined) {
                var fileinfo = {
                  "id": file.id,
                  "name": file.name,
                  "mimeType": file.mimeType,
                  "modifiedTime": file.modifiedTime,
                  "size": file.size,
                  "parents": file.parents
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
        }
      }
    });
  }

  initGoogle(usr_session, function(oauth2Client) {

    listFiles(oauth2Client);

  });
};

module.exports.download = function(fileId) {

  function download(drive, fileId) {
    drive.files.get({
      fileId: fileId
    }, (err, metadata) => {
      if (err) {
        throw err;
      }
      console.log('Downloading %s...', metadata.name);
      //download path 지정
      var downloadpath = '/Users/ikhwan/dev/js/moaa_dev/Moaa/test/upload/uploads/';
      const dest = fs.createWriteStream(downloadpath + metadata.name);
      //이건 readStream
      drive.files.get({
          fileId: fileId,
          alt: 'media'
        })
        .on('error', err => {
          console.error('Error downloading file');
          throw err;
        })
        .pipe(dest);

      dest
        .on('finish', () => {
          console.log('Downloaded %s!', metadata.name);
          dest.close();

        })
        .on('error', err => {
          console.error('Error writing file!');
          throw err;
        });
    });
  }
  var usr_session = null;

  initGoogle(usr_session, function(oauth2Client) {
    var drive = google.drive({
      version: 'v3',
      auth: oauth2Client
    });
    download(drive, fileId);
  });
}

module.exports.upload = function(FileInfo, Folder) {
  var usr_session = null;
  initGoogle(usr_session, function(oauth2Client) {
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
        fields: 'id'
      }, function(err, file) {
        if (err) {
          console.error(err);
        } else {
          console.log('Uploaded!');

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
        fields: 'id'
      }, function(err, file) {
        if (err) {
          console.error(err);
        } else {
          console.log('Uploaded!');

        }
      });
    }



  });


}

module.exports.delete = function(fileId) {
  var usr_session = null;
  initGoogle(usr_session, function(oauth2Client) {
    var drive = google.drive({
      version: 'v3',
      auth: oauth2Client
    });

    function deletefile(fileId) {
      var request = drive.files.delete({
        'fileId': fileId
      });

    }
    deletefile(fileId);
  });
}
