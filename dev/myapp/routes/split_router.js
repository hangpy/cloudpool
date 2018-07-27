module.exports = function() {

  var router = require('express').Router();
  var java = require('java');
  var path = require('path');
  var splitUtil = require('../app_modules/split/split_util.js');
  var bodyParser = require('body-parser');
  var storage = splitUtil.storage;
  var multer = require('multer');


  var upload = multer({
    storage: storage
  });
  //
  //
  router.use(bodyParser.urlencoded({
    extended: false
  }));
  router.use(bodyParser.json());

  router.get('/folder/', (req, res) => {
    splitUtil.loadData(req.user.userID, function(rows) {
      splitUtil.directory(rows, 1, function(childList, folderList, depth) {
        res.render('split_list', {
          FolderID: '',
          filelist: childList,
          folderlist: folderList,
          depth: 1
        });
      });
    });
  });

  router.get('/folder/:id', (req, res) => {
    var params = req.params.id;
    var variables = params.split('*');
    var id = variables[0];
    var depth = variables[1];
    depth *= 1;
    depth += 1;
    console.log('params : ' + req.params.id);
    console.log('id : ' + id);
    console.log('depth : ' + depth);
    splitUtil.loadData(req.user.userID, function(rows) {
      splitUtil.directory(rows, depth, function(childList, folderList, depth) {
        console.log('log router');
        console.log('childList : '+childList);
        console.log('folderList : '+folderList);
        console.log('depth : ' + depth);
        res.render('split_list',{
          FolderID : id,
          filelist : childList,
          folderlist: folderList,
          depth: depth
        });
      });
    });
  });

  router.post('/move/', function(req, res){
    var FolderID = req.body.FolderID;
    var target =  req.body.filename;
    var dest = req.body.dest;
    splitUtil.move(FolderID, target, dest);

  })
//

  router.post('/upload/', upload.single('userfile'), function(req, res)
  {
    console.log('upload');

    var orgFile = splitUtil.orgFile(__dirname, req.file.path);
    var filesToAdd = splitUtil.filesToAdd;
    filesToAdd.addSync(orgFile);
    splitUtil.checkDrive(req.user.userID, function(driveState) {
      console.log('driveState check');
      var size = splitUtil.sizeSplit(req.file.size, driveState);
      console.log("Split size : "+size);
      //분리될 파일이 저장될곳
      var zipFile = splitUtil.zipFileU(__dirname, req.file.filename);
      var parameters = splitUtil.parameters();
      var target = [];
      //원래 파일 저장
      zipFile.createZipFile(filesToAdd, parameters, true, size ,function(err, result){
        if(err){
          console.log(err);
        } else {
          zipFile.getSplitZipFiles(function(err, results){
            if(err){
              console. log("Split error : "+err);
            }
            else{
              console.log("Complete Zip4J from " +req.file.filename);
              splitUtil.upload(results, req.file.size, driveState, req, res);
              //파일 삭제 추가
            }
          });
        }
      });
    });
  });


  router.post('/download/', function(req, res) {
    var fileID = req.body.name;
    console.log('fileID : ' + req.body.name);
    splitUtil.download(fileID, req, res, function(zippath) {
      splitUtil.unzip_zip4j(fileID, zippath, req, res, function(orgdir, orgfilename) {
        res.download(orgdir, function() {
          fs.unlink(orgdir);
        });
      });
    });
  });


  router.post('/rename/', function(req, res) {
    var newName = req.body.filename;
    var splitFileID = req.body.name;
    splitUtil.rename(splitFileID, newName);

  });

  return router;
}
