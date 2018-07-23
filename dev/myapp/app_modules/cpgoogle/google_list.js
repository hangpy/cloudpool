module.exports = function(FolderID, callback){
var path = require('path')
, {google} = require('googleapis')
, async = require('async')
, initGoogle = require('./google_init')
, filelist = [];

var usr_session = null;


function listFiles(oauth2Client) {
  var folder = FolderID;
  console.log("getGlist_final's folder id is"+folder);
  var service = google.drive('v3');
  DirFiles(service,oauth2Client,folder);
}

//승엽 파일 리스트
function DirFiles(service,oauth2Client,folder){

  var query = "parents in "+folder+" and trashed = false "
 // var query = "parents in "+'\'root\''+" and trashed = false "
  service.files.list({
    q: query,
    auth: oauth2Client,
    pageSize: 100,
    fields: "nextPageToken, files(id, name,mimeType,createdTime,modifiedTime,size,parents)"
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    else{

      var _filelist = response.data.files;
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

    }
  });
}

  initGoogle(usr_session, function(oauth2Client){

    listFiles(oauth2Client);

  });
};
