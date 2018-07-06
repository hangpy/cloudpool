module.exports = function(){

  var route = require('express').Router();
  var app = express();
  var java = require('java');
  var path = require('path');
  var splitUtil = require('../app_modules/split/split_util.js');

  var upload = splitUtil.upload;

  route.post('/upload',
  //upload.single('userfile'),
  function(req, res){
    upload(req,res,(function(err){
      if(err){
        return res.end("Error uploading file.");
      }
      res.end("File is uploaded");
    }))
    //65536 Bytes 이상만 분할가능
    var size== splitUtil.sizeSplit(req.file.size);
    //연동된 드라이브 수 / 남은 용량에 맞게 분할시킬 사이즈 정해야한다.

    }
  console.log("split size : "+ size);
    //분리될 파일이 저장될곳
    var zipFile = splitUtil.files.zipFile(__dirname, req.file.filename);
    var parameters = splitUtil.files.parameters();
    var filesToAdd = splitUtil.files.fileToAdd;
    //원래 파일 저장
    var orgFile = splitUtil.files.orgFile(__dirname, req.file.path);

    parameters.setCompressionMethod(8, function(err, result){
      if(err){
        console.log(err);
      }
    });
    parameters.setCompressionLevel(5, function(err, result){
      if(err){
        console.log(err);
      }
    });

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


}
