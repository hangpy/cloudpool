module.exports.upload = function(FileInfo, FolderID){
  var fs = require('fs');
  var BoxSDK = require('box-node-sdk');
  var client = require('./box_auth.js')();

  var stream = fs.createReadStream(FileInfo.path);
  client.files.uploadFile(FolderID, FileInfo.name, stream, function(err ,newfile){
    if(err) console.log(err);
    else{
      //파일 아이디
      console.log(newfile.entries[0].id);
    }
  });
}

module.exports.download = function(fileId){
  var fs = require('fs');
  var BoxSDK = require('box-node-sdk');
  var client = require('./box_auth.js')();

  client.files.getReadStream(fileId).then(stream => {
    client.files.get(fileId).then(file => {
      var fileName = file.name;
      console.log(fileName);
      var output = fs.createWriteStream('../app_modules/cpbox/download/'+fileName);
      stream.pipe(output);
    })
  })
}

module.exports.uploadSplit = function(FilePath, FolderID){
  var fs = require('fs');
  var BoxSDK = require('box-node-sdk');
  var client = require('./box_auth.js')();
  var splitedname = FilePath.split("\\");
  var FileName =splitedname[(splitedname.length)-1];
  var stream = fs.createReadStream(FilePath);
  client.files.uploadFile(FolderID, FileName, stream, function(err ,newfile){
    if(err) console.log(err);
    else{
      //파일 아이디
      console.log(newfile.entries[0].id);
    }
  });
}
