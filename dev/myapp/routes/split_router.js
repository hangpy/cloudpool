module.exports = function(){

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
  router.use(bodyParser.urlencoded({ extended: false }));
  router.use(bodyParser.json());

  router.get('/folder/', (req, res)=>{
    console.log('split main');
    splitUtil.loadData(req.user.userID, function(rows){
      splitUtil.directory(rows, 1, '',function(childList, folderList){
        console.log('childList : '+childList);
        console.log('folderList : '+folderList);
        res.render('split_list',{
          FolderID : '',
          filelist : childList,
          folderlist: folderList
        });
      });
    });
  });

  router.get('/folder/:id', (req, res)=>{
    console.log('split main');
    var head = req.body.head;
    var depth = req.body.depth;
    splitUtil.loadData(req.user.userID, function(rows){
      splitUtil.directory(rows, depth, head,function(childList, folderList){
        res.render('split_list',{
          FolderID : head,
          filelist : childList,
          folderlist: folderList
        });
      });
    });
  });
//
  router.post('/upload/', upload.single('userfile'), function(req, res)
  {
    var orgFile = splitUtil.orgFile(__dirname, req.file.path);
    var filesToAdd = splitUtil.filesToAdd;
    filesToAdd.addSync(orgFile);
    var size = splitUtil.sizeSplit(req.file.size);
    console.log("Split size : "+size);
    //분리될 파일이 저장될곳
    var zipFile = splitUtil.zipFileU(__dirname, req.file.filename);
    var parameters = splitUtil.parameters();
    var target = [];
    //원래 파일 저장
    zipFile.createZipFile(filesToAdd, parameters, true, size ,function(err, result){
      if(err){
        console.log(err);
      }else {
        zipFile.getSplitZipFiles(function(err, results){
          if(err){
            console. log("Split error : "+err);
          }
          else{
            console.log("Complete Zip4J from " +req.file.filename);
            splitUtil.upload(results, req.file.size, req, res);
            //파일 삭제 추가
          }
        });
      }
    });
  });


  router.post('/download/',function(req, res){
    var fileID = req.body.name;
    console.log('fileID : ' + req.body.name);
    splitUtil.download(fileID, req, res, function(zippath){
      splitUtil.unzip_zip4j(fileID, zippath, req, res, function(orgdir, orgfilename){
        res.download(orgdir, function(){
          fs.unlink(orgdir);
        });
      });
    });
  });


  router.post('/rename/', function(req, res){
    var newName =req.body.filename;
    var splitFileID= req.body.name;
    splitUtil.rename(splitFileID,newName);

  });

  router.post('/folder/', function(req,res){


  })

  router.post('/folder/:id', function(req, res){

  });

    return router;
  }
