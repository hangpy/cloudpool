var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
var formidable = require('formidable');
var fs = require('fs');
var google_util=require('../app_modules/cpgoogle/google_util.js');//수정
router.use(bodyParser.urlencoded({ extended: false }));

// 동시삭제, 동시다운로드 불가 다운로드 및 삭제 방식 변경 필요 

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

    res.redirect('/google/'+FolderID);
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

  google_util.list(ID, function(filelist) { //callback 함수를 통해 정보를 받아온다.
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
  console.log('router id: ',req.params.id);
  if(req.params.id=='root') folderID=req.params.id;
  else{
    folderID = req.params.id;
  } 
  google_util.list(folderID, function(filelist){
    console.log("return - 3");
    // console.log(filelist);
    res.render('google_list',{
        FolderID : req.params.id,
        filelist: filelist
    });
  })
});

module.exports = router;
