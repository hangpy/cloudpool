module.exports = (function(){
  var async = require('async');
  var fs = require('fs');
  var request = require('request');

  var listFileRest = function(user_id, folderId, callback){
    var data = {
      "user_id": user_id,
      "folderID": folderId
    };
    request.post({
      url: 'http://localhost:4000/api/box/check/',
      body: data,
      json: true
    },
    function(error, response, body) {
      callback(body.list, body.path, body.pathname);
    });
  }

  var refreshFileRest = function(user_id, callback){
    var data = {
      "user_id": user_id
    };
    request.post({
      url: 'http://localhost:4000/api/box/refresh/filelist',
      body: data,
      json: true
    },
    function(error, response, body) {
      callback(body);
    });
  }

  var relieveRest = function(user_id, callback){
    var data = {
      "user_id": user_id
    };
    request.post({
      url: 'http://localhost:4000/api/box/relieve',
      body: data,
      json: true
    },
  function(error, response, body) {
    callback(body);
  })
  }

  var uploadFileRest = function(user_id, folderId, FileInfo, callback) {
    var data = {
      "user_id": user_id,
      "folderId": folderId,
      "FileInfo": FileInfo
    };
    request.post({
      url: 'http://localhost:4000/api/box/upload',
      body: data,
      json: true
    },
    function(error, response, body) {
      callback(body);
    });
  }

  var uploadFileSplit = function(client, FilePath, FolderID, callback){
    var splitedname = FilePath.split("\\");
    var FileName =splitedname[(splitedname.length)-1];
    var stream = fs.createReadStream(FilePath);
    client.files.uploadFile(FolderID, FileName, stream, function(err ,newfile){
      if(err) console.log(err);
      else{
        //파일 아이디
        console.log(newfile.entries[0].id);
        callback(newfile.entries[0].id);
      }
    });
  }


  var downloadFile = function(client, fileId, res){
    client.files.getReadStream(fileId).then(stream => {
      client.files.get(fileId).then(file => {
        var fileName = file.name;
        console.log(fileName);
        var newFileName = encodeURIComponent(fileName);

        res.setHeader('Content-disposition', 'attachment; filename*=UTF-8\'\'' + newFileName); //origFileNm으로 로컬PC에 파일 저장
        // res.setHeader('Content-type', mimetype);
        stream.pipe(res)
        .on('finish', function () { console.log("finish"); });
      })
    })
  }


  var downloadFileSplit = function(client, fileId, callback){
    client.files.getReadStream(fileId).then(stream => {
      client.files.get(fileId).then(file => {
        var fileName = file.name;
        console.log("box fileName : "+ fileName);
        callback(fileName);
        var output = fs.createWriteStream('../routes/downloads/dis/'+fileName);
        stream.pipe(output);
      })
    })
  }

  var deleteFileRest = function(userID, fileId, callback) {
    var data = {
      "user_id": userID,
      "fileId": fileId
    };
    request.post({
      url: 'http://localhost:4000/api/box/delete',
      body: data,
      json: true
    },
    function(error, response, body) {
      callback(body);
    });
  }

  var createFolderRest = function(userID, folderID, foldername, callback) {
    var data = {
      "user_id": userID,
      "folderID": folderID,
      "foldername": foldername
    };
    request.post({
      url: 'http://localhost:4000/api/box/create',
      body: data,
      json: true
    },
    function(error, response, body) {
      callback(body);
    });
  }

  var renameFileRest = function(userID, fileId, filename, callback) {
    var data = {
      "user_id": userID,
      "fileId": fileId,
      "filename": filename
    };
    request.post({
      url: 'http://localhost:4000/api/box/rename',
      body: data,
      json: true
    },
    function(error, response, body) {
      callback(body);
    });
  }

  var movePathRest = function(userID, fileId, pathId, callback) {
    var data = {
      "user_id": userID,
      "fileId": fileId,
      "pathId": pathId
    };
    request.post({
      url: 'http://localhost:4000/api/box/movepath',
      body: data,
      json: true
    },
    function(error, response, body) {
      callback(body);
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

  var searchRest = function(user_id, content, callback){
    var data = {
      "user_id": user_id,
      "content": content
    };
    request.post({
      url: 'http://localhost:4000/api/box/search/',
      body: data,
      json: true
    },
    function(error, response, body) {
      callback(body.list);
    });
  }

  var selectRest = function(user_id, selecttype, callback){
    var data = {
      "user_id": user_id,
      "selecttype": selecttype
    };
    request.post({
      url: 'http://localhost:4000/api/box/select/',
      body: data,
      json: true
    },
    function(error, response, body) {
      callback(body.list);
    });
  }

  var spaceCheck = function(client, callback) {
    client.users.get(client.CURRENT_USER_ID, null, function(err, info){
      if(err)console.log(err);
      else{
        console.log("used : "+ info.space_used);
        console.log("Total : "+ info.space_amount);
        callback(info.space_amount, info.space_used);
      }
    });
  }


  return {
    listFileRest: listFileRest,
    refreshFileRest: refreshFileRest,
    relieveRest: relieveRest,
    uploadFileRest: uploadFileRest,
    uploadSplit: uploadFileSplit,
    downloadFile: downloadFile,
    downloadSplit: downloadFileSplit,
    deleteFileRest: deleteFileRest,
    createFolderRest: createFolderRest,
    renameFileRest: renameFileRest,
    movePathRest: movePathRest,
    thumbnail: thumbnail,
    searchRest: searchRest,
    selectRest: selectRest,
    spaceCheck: spaceCheck
  }

})();
