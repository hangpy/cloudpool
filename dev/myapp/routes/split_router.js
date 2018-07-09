module.exports = function(){

  var route = require('express').Router();
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
  // route.use(bodyParser.urlencoded({ extended: false }));
  route.get('/', (req, res)=>{
    console.log('split main');
    res.render('upload');
  });
//
  route.post('/upload/',upload.single('userfile'),function(req, res)
  {
    // upload(req, res, (function(err){
    //   if(err){
    //     return res.end("Error uploading file.");
    //   }
    //   res.end("File is uploaded");
    // }));
    // // console.log(req);
    console.log(req.body);
    console.log(req.file.path);
    //65536 Bytes 이상만 분할가능
    var orgFile = splitUtil.orgFile(__dirname, req.file.path);

    console.log("org size : "+ req.file.size);
    var size = splitUtil.sizeSplit(req.file.size);
    console.log("split size : "+ size);
    //연동된 드라이브 수 / 남은 용량에 맞게 분할시킬 사이즈 정해야한다.

    //분리될 파일이 저장될곳
    var zipFile = splitUtil.zipFile(__dirname, req.file.filename);
    var parameters = splitUtil.parameters();
    var filesToAdd = splitUtil.filesToAdd;
    //원래 파일 저장


    filesToAdd.addSync(orgFile);

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
            console.log(results.sizeSync());
            console.log(results.getSync(0));
          }
        });
      }
    });

    res.send('Uploaded! : '+req.file); // object를 리턴함
    console.log(req.file); // 콘솔(터미널)을 통해서 req.file Object 내용 확인 가능.
  });
    return route;
  }
