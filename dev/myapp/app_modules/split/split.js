module.exports = function(){
  const route = require('express').Router();
  const java = require('java');
  const path = require('path');
  const multer = require('multer');
  const min = 65536;
  const minDouble = min * 2;
  const minTriple = min * 3;

  java.classpath.push(path.resolve(__dirname,'zip4j-1.3.2.jar'));
  console.log(__dirname);
  java.classpath.push("./");


  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/org/') // cb 콜백함수를 통해 전송된 파일 저장 디렉토리 설정
    },
    filename: function (req, file, cb) {
      cb(null, Date.now()+file.originalname) // cb 콜백함수를 통해 전송된 파일 이름 설정
    }
  });

  var upload = multer({ storage: storage }).single('userfile');


  router.get('/upload', function(req, res){

    upload(req, res, funtion(err){
        if(err){
          res.send(error)
        };
        res.end("File is uploaded");
      })

      var size = 0;

      if(req.file.size > minTriple){
        size = parseInt(req.file.size / 3);
      }else if (req.file.size > minDouble){
        size = parseInt(req.file.size / 2);
      }else{
          size = req.file.size;
      }
      
      console.log("Split size : "+ size);

      var zipFile = java.newInstanceSync("net.lingala.zip4j.core.ZipFile",__dirname+"/uploads/dis/"+req.file.filename+".zip");
      var filesToAdd = java.newInstanceSync("java.util.ArrayList");
      //원래 파일 저장
      var orgFile =java.newInstanceSync("java.io.File",__dirname+"/"+req.file.path);
      var parameters = java.newInstanceSync("net.lingala.zip4j.model.ZipParameters");

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
              console.log("Split error : "+err);
            }
            else{
              console.log("Complete Zip4J from " +req.file.filename);
              console.log(results.sizeSync());
              console.log(results.getSync(0));
            }
          });
        }
      });

      res.render();
      console.log(req.file);

      }
  });




  );
}
