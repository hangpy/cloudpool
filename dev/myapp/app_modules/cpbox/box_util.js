module.exports = (function(){
  var async = require('async');
  var fs = require('fs');

  var listFile = function(client, folderId, callback){
    var filelist = [];
    client.folders.get(folderId).then(function(folder){
      if(folder.id!=0){
        var iteminfo = {
          'id' : folder.parent.id,
          'name' : '..',
          'mimeType' : folder.type
        }
        filelist.push(iteminfo);
      }
      client.folders.getItems(
        folderId,
        {
          fields: 'name,size,modified_at'
        })
        .then(function(items){
          async.map(items.entries, function(item, callback_list){
            var iteminfo = {
              'id' : item.id,
              'name' : item.name,
              'mimeType' : item.type,
              'modifiedTime' : item.modified_at,
              'size' : item.size,
              'parents' : folderId
            }
            filelist.push(iteminfo);
            callback_list(null, "finish");
          }, function(err, result){
            if(err) console.log(err);
            else {
              console.log('Finish the File list');
              callback(filelist);
            }
          });
        });
    })
  }

  var uploadFile = function(client, FileInfo, FolderID){
    var stream = fs.createReadStream(FileInfo.path);
    client.files.uploadFile(FolderID, FileInfo.name, stream, function(err ,newfile){
      if(err) console.log(err);
      else{
        //파일 아이디
        console.log(newfile.entries[0].id);
      }
    });
  }

  var downloadFile = function(client, fileId){
    client.files.getReadStream(fileId).then(stream => {
      client.files.get(fileId).then(file => {
        var fileName = file.name;
        console.log(fileName);
        var output = fs.createWriteStream('../app_modules/cpbox/download/'+fileName);
        stream.pipe(output);
      })
    })
  }

  var deleteFile = function(client, fileId){
    client.files.delete(fileId).then(() => {
      console.log('deletion succeeded');
    })
  }

  var renameFile = function(client, fileId, newname){
    client.files.update(fileId, {name : newname})
  	.then(updatedFile => {
  		console.log('renaming file completed');
  	});
  }

  var renameFolder = function(client, folderId, newname){
    client.folders.update(folderId, {name : newname})
  	.then(updatedFolder  => {
  		console.log('renaming folder completed');
  	});
  }

  var moveFile = function(client, fileId, parentId){
    client.files.update(fileId, {parent : {id : parentId}})
  	.then(updatedFile => {
  		console.log('moving file completed');
  	});
  }

  var moveFolder = function(client, folderId, parentId){
    client.folders.update(folderId, {parent : {id : parentId}})
  	.then(updatedFolder => {
  		console.log('moving folder completed');
  	});
  }

  var thumbnail = function(client, fileId){
    client.files.getThumbnail(fileId)
  	.then(thumbnailInfo => {
  		if (thumbnailInfo.location) {
  			// fetch thumbnail from URL
        console.log('fetch thumbnail from URL');
        console.log(thumbnailInfo);
  		} else if (thumbnailInfo.file) {
  			// use response.file Buffer contents as thumbnail
        console.log('use response.file Buffer contents as thumbnail');
        console.log(thumbnailInfo);
  		} else {
  			// no thumbnail available
        console.log('no thumbnail available');
  		}
  	});
  }

  var search = function(client, searchText, callback){
    client.search.query(
  	searchText,
  	{
  		//options
      type: 'file'
  	})
  	.then(results => {
      var filelist = [];
      async.map(results.entries, function(item, callback_list){
        var iteminfo={
          'id' : item.id,
          'name' : item.name,
          'mimeType' : item.type,
          'modifiedTime' : item.modified_at,
          'size' : item.size,
          'parents' : item.parent.id
        };
        filelist.push(iteminfo);
        callback_list(null, 'finish');
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

  var listAllFiles = function(client, folderId, callback) {
    client.folders.getItems(
      folderId,
      {
        fields: 'name,size,modified_at'
      })
      .then(function(items){
      var filelist = [];
      async.map(items.entries, function(item, callback_list){
        var iteminfo = {
          'id' : item.id,
          'name' : item.name,
          'mimeType' : item.type,
          'modifiedTime' : item.modified_at,
          'size' : item.size,
          'parents' : folderId
        }
        filelist.push(iteminfo);
        if(item.type=='folder'){
          listAllFiles(client,item.id,function(filelist_child){
            filelist = filelist.concat(filelist_child);
            callback_list(null, "finish");
          });
        } else callback_list(null, "finish");
      }, function(err, result){
        if(err) console.log(err);
        else {
          console.log('Finish the File list:'+folderId);
          callback(filelist);
        }
      });
    });
  }


  return {
    listFile: listFile,
    uploadFile: uploadFile,
    downloadFile: downloadFile,
    deleteFile: deleteFile,
    renameFile: renameFile,
    renameFolder: renameFolder,
    moveFile: moveFile,
    moveFolder: moveFolder,
    thumbnail: thumbnail,
    search: search,
    listAllFiles: listAllFiles
  }

})();
