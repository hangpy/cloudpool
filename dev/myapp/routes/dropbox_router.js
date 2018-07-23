module.exports = function(){

  var route = require('express').Router();
  var fs = require('fs');
  var dbxutil=require('../app_modules/cpdropbox/dropbox_util.js');
  var formidable = require('formidable');
  var bodyParser = require('body-parser');

  //list - root
  route.get('/', (req,res)=>{
      var folderID = '';
    dbxutil.dbx.list(folderID, function(filelist){
      res.render('dropbox_list',{
          FolderID : '',
          filelist:filelist
      });
    })
  });

  //list - folder

  route.get('/:id', (req,res)=>{

    if(req.params.id.includes('%25')){
      var name = req.params.id.replace("%25","%");
    }
    else var name = req.params.id

    var folderID = '/'+name.replace(/[*]/g,"/");
    dbxutil.dbx.list(folderID, function(filelist){
      res.render('dropbox_list',{
          FolderID : req.params.id,
          filelist:filelist
      });
    })
  });


  //delete - root

  route.post('/delete/',function(req,res){
    var FolderID = '';
    var FileName = req.body.name;
    dbxutil.dbx.delete(FileName,FolderID);
    //삭제하고나서 리프레쉬!
    // dbxutil.dbx.list(FolderID, function(filelist){
    //   res.render('dropbox_list',{
    //       FolderID : '',
    //       filelist:filelist
    //   });
    // });
  });

  //delete -folder

  route.post('/delete/:id',function(req,res){
    var FolderID = '/'+req.params.id.replace(/[*]/g,"/");
    var FileName = req.body.name;

      res.redirect('dropbox/'+req.params.id);
      //비동기 필요
      // dbxutil.dbx.delete(FileName,FolderID);
  });


  //download - root

  route.post('/download/',function(req,res){
    var FolderID = '';
    console.log(req.body);
    var FileID = req.body.name;


      //비동기 필요
      dbxutil.dbx.download(FileID,FolderID,req,res);
      // res.redirect('/'+FolderID);
  });

  //download - folder

  route.post('/download/:id',function(req,res){
    var FolderID = '/'+req.params.id.replace(/[*]/g,"/");
    var FileID = req.body.name;


      //비동기 필요
      dbxutil.dbx.download(FileID,FolderID,req,res);
        // res.redirect('/'+req.params.id);
  });







  //upload - root

  route.post('/upload/',function(req,res){
    var FolderID = '';
    var form = new formidable.IncomingForm();

    form.parse(req, function(err, fields, files) {

      var FileInfo = files.uploads_list;

      // console.log(FileInfo);
      // res.redirect('/'+FolderID);
      //비동기 필요
      dbxutil.dbx.upload(FileInfo,FolderID);

    });
  });

  //upload - folder
  route.post('/upload/:id',function(req,res){
    var folderID = '/'+req.params.id.replace(/[*]/g,"/");

    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {

      var FileInfo = files.uploads_list;
      // res.redirect('/'+req.params.id);
      //비동기 필요
      dbxutil.dbx.upload(FileInfo,folderID);

    });
  });
  return route;
}
// module.exports = route;
