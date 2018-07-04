module.exports.list = function(FolderID, callback){
  var BoxSDK = require('box-node-sdk');
  var client = require('./box_auth.js')();
  var async = require('async');

  client.folders.get(FolderID).then(items => {
    var filelist = [];
    if(FolderID!='0') {
      var before={
        'id' : items.parent.id,
        'name' : '..',
        'mimeType' : 'folder'
      };
      filelist.push(before);
    }
    async.map(items.item_collection.entries, function(item, callback_list){
      client.folders.get(item.id).then(function(folder){
        var iteminfo={
          'id' : item.id,
          'name' : item.name,
          'mimeType' : item.type,
          'modifiedTime' : folder.modified_at,
          'size' : folder.size,
          'parents' : FolderID
        };
        filelist.push(iteminfo);
        callback_list(null, 'finish');

      }, function(err){
        client.files.get(item.id).then(file => {
          var iteminfo={
            'id' : item.id,
            'name' : item.name,
            'mimeType' : item.type,
            'modifiedTime' : file.modified_at,
            'size' : file.size,
            'parents' : FolderID
          };
          filelist.push(iteminfo);
          callback_list(null, 'finish');

        })
      })


    },
    function(err,result){
      if(err) console.log(err);
      //list 받아오기 완료
      else {
        console.log('Finish the File list');
        callback(filelist);
      }

    });
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

module.exports.delete = function(fileId){
  var fs = require('fs');
  var BoxSDK = require('box-node-sdk');
  var client = require('./box_auth.js')();

  client.files.delete(fileId).then(() => {
    console.log('deletion succeeded');
  })
}
