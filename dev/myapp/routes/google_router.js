var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
var formidable = require('formidable');
var fs = require('fs');
var google_util=require('../app_modules/cpgoogle/google_util.js');//수정
router.use(bodyParser.urlencoded({ extended: false }));

// 동시삭제, 동시다운로드 불가 다운로드 및 삭제 방식 변경 필요 
router.post('/makedir/:id',function(req,res){
  var foldername;
  var FolderID;
  google_util.makedir(foldername,FolderID);

});

router.post('/getthumbnail/:id',function(req,res){

  var fileId;
  google_util.getthumbnailLink(fileId);
});

router.post('/copy/:id',function(req,res){
  var FileID;
  google_util.copy(FileID);

});

router.post('/searchtype/:id',function(req,res){
  var Filetype;
  google_util.updatefile(Filetype);

});

router.post('/searchname/:id',function(req,res){
  var Filename;

  google_util.updatefile(Filename);

});

router.post('/updatefile/:id',function(req,res){
  var Newname;
  var fileId;

  google_util.updatefile(Newname,fileId);

});

router.post('/updatedir/:id',function(req,res){
  var fileId ;
  var folderId ;
  google_util.updatedir(fileId,folderId);
});

router.post('/download',function(req,res){
  var FileID = req.body.name;
  console.log('fileid : ',FileID);
  google_util.download(res,FileID);
});


router.post('/upload/:id',function(req,res){
  var FolderID = req.params.id;
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {

    var FileInfo = files.userfile;
    //시각적으로 비동기 필요
  
    //비동기 필요
    google_util.upload(FileInfo,FolderID);
  });
});

router.post('/delete',function(req,res){
  var backURL = req.header('Referer') || '/';
  var FileID = req.body.name;
  google_util.delete(FileID);
  res.redirect(backURL);
});

router.get('/', (req,res)=>{
  console.log("arrive - 2");
  var ID='root';
  var orderkey = 'folder';//default
  google_util.list(ID,orderkey, function(filelist) { //callback 함수를 통해 정보를 받아온다.
    console.log("return - 2");
    res.render('google_list',{
      FolderID : ID,
      filelist:filelist
    });
  });

});

router.get('/:id', (req,res)=>{
  console.log("arrive - 3");
  var folderID;
  var orderkey = 'folder';//default
  console.log('router id: ',req.params.id);
  if(req.params.id=='root') folderID=req.params.id;
  else{
    folderID = req.params.id;
  } 
  google_util.list(folderID,orderkey, function(filelist){
    console.log("return - 3");
    // console.log(filelist);
    res.render('google_list',{
        FolderID : req.params.id,
        filelist: filelist
    });
  })
});

module.exports = router;
