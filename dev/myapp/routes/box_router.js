
var formidable = require('formidable');
var route = require('express').Router();
var fs = require('fs');
var box_util=require('../app_modules/cpbox/box_util.js');
var async = require('async');

route.post('/delete',function(req,res){
  var backURL = req.header('Referer') || '/';
  console.log(req.body);
  var FileID = req.body.name;
  if(Array.isArray(FileID)) {
    async.map(FileID, function(id, callback){
      box_util.delete(id);
      callback(null, 'finish');
    });
  }
  else {
    box_util.delete(FileID);
  }
  res.redirect(backURL);
});

route.post('/download',function(req,res){
  var backURL = req.header('Referer') || '/';
  console.log(req.body);
  var FileID = req.body.name;
  if(Array.isArray(FileID)) {
    async.map(FileID, function(id, callback){
      box_util.download(id);
      callback(null, 'finish');
    });
  }
  else {
    box_util.download(FileID);
  }
  res.redirect(backURL);
});

route.post('/upload/:id',function(req,res){
  var FolderID = req.params.id;
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {

    var FileInfo = files.userfile;

          res.redirect('/'+FolderID);

    //비동기 필요
    box_util.upload(FileInfo,FolderID
    //   , function(message){
    //     console.log(message);
    //   res.redirect('/'+FolderID);}
    );

  });
});

route.get('/', (req,res)=>{
  // ID='\'root\'';
  ID='0';

  box_util.list(ID, function(filelist) { //callback 함수를 통해 정보를 받아온다.
    console.log("return - 2");
    res.render('box_list',{
      FolderID : ID,
      filelist:filelist
    });
  });

});

route.get('/:id', (req,res)=>{
  // var folderID = '\''+req.params.id+'\'';
  var folderID = req.params.id;

  box_util.list(folderID, function(filelist){
    console.log("return - 3");

    res.render('box_list',{
        FolderID : folderID,
        filelist:filelist
    });
  })
});

module.exports = route;
