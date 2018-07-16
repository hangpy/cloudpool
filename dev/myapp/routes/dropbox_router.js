module.exports = function(){

  var route = require('express').Router();
  var fs = require('fs');
  var dbxutil=require('../app_modules/cpdropbox/dropbox_util.js');
  var formidable = require('formidable');
  var bodyParser = require('body-parser');
  //list - root
  route.get('/folder/', (req,res)=>{
      var folderID = '';
      console.log("read folder/");
      dbxutil.dbx.getlistRest(folderID, function(filelist){
        res.render('dropbox_list',{
            FolderID : '',
            filelist: filelist
        });
      })

  });

  //list - folder

  route.get('/folder/:id', (req,res)=>{
      console.log("read folder/id");
    if(req.params.id.includes('%25')){
      var name = req.params.id.replace("%25","%");
    }
    else var name = req.params.id

    var folderID = '/'+name.replace(/[*]/g,"/");

    dbxutil.dbx.getlistRest(folderID, function(filelist){
      res.render('dropbox_list',{
          FolderID : req.params.id,
          filelist : filelist
      });
    })
  });

  //search list view - root
  route.post('/search/folder/', (req,res)=>{
      var folderID = '';
      console.log("read search folder/");
      var searchfilelist = JSON.parse(req.body.obj);
      res.render('dropbox_list',{
            FolderID : '',
            filelist: searchfilelist
      });
  });

  //search list view - folder

  route.post('/search/folder/:id', (req,res)=>{
      console.log("read folder/id");
    if(req.params.id.includes('%25')){
      var name = req.params.id.replace("%25","%");
    }
    else var name = req.params.id
    var folderID = '/'+name.replace(/[*]/g,"/");
    var searchfilelist = JSON.parse(req.body.obj);
    res.render('dropbox_list',{
          FolderID : req.params.id,
          filelist: searchfilelist
    });
  });


  //select list - root
  route.post('/select/folder/', (req,res)=>{
      var folderID = '';
      console.log("read search folder/");
      var searchfilelist = JSON.parse(req.body.obj);
      res.render('dropbox_list',{
            FolderID : '',
            filelist: searchfilelist
      });
  });

  //select list - folder

  route.post('/select/folder/:id', (req,res)=>{
      console.log("read folder/id");
    if(req.params.id.includes('%25')){
      var name = req.params.id.replace("%25","%");
    }
    else var name = req.params.id
    var folderID = '/'+name.replace(/[*]/g,"/");
    var searchfilelist = JSON.parse(req.body.obj);
    res.render('dropbox_list',{
          FolderID : req.params.id,
          filelist: searchfilelist
    });
  });



  //rename - root

  route.post('/rename/',function(req,res){
    var FolderID = '';
    var originName = req.body.originname;
    var type = originName.split(".")[1];
    var newName = req.body.newname+"."+type;
    dbxutil.dbx.sendrenameRest(newName, originName, FolderID, function(result){
      if(result =="finish_rename_the_file"){
        res.json("finish");
      }
      else{
        res.json("error");
      }
    })
  });

  //rename -folder

  route.post('/rename/:id',function(req,res){
    var FolderID = '/'+req.params.id.replace(/[*]/g,"/");
    var originName = req.body.originname;
    var type = originName.split(".")[1];
    var newName = req.body.newname+"."+type;
    dbxutil.dbx.sendrenameRest(newName, originName, FolderID, function(result){
      if(result =="finish_rename_the_file"){
        res.json("finish");
      }
      else{
        res.json("error");
      }
    })
  });

  //search - root

  route.post('/search/',function(req,res){
    var FolderID = '';
    var searchname = req.body.searchname;
    var searchFolder = req.body.searchfolder;
    var searchtype = req.body.searchtype;
    dbxutil.dbx.sendsearchRest(searchname, searchFolder, searchtype, FolderID, function(result){
        res.json(result);
    })
  });

  //search -folder

  route.post('/search/:id',function(req,res){
    var FolderID = '/'+req.params.id.replace(/[*]/g,"/");
    var searchname = req.body.searchname;
    var searchFolder = req.body.searchfolder;
    var searchtype = req.body.searchtype;
    dbxutil.dbx.sendsearchRest(searchname, searchFolder, searchtype, FolderID, function(result){
        res.json(result);
    })
  });

  //select - root

  route.post('/select/',function(req,res){
    var FolderID = '';
    var selecttype = req.body.selecttype;
    dbxutil.dbx.sendselectRest(selecttype, FolderID, function(result){
        res.json(result);
    })
  });

  //select -folder

  route.post('/select/:id',function(req,res){
    var FolderID = '/'+req.params.id.replace(/[*]/g,"/");
    var selecttype = req.body.selecttype;
    dbxutil.dbx.sendselectRest(selecttype, FolderID, function(result){
        res.json(result);
    })
  });

  //delete - root

  route.post('/delete/',function(req,res){
    var FolderID = '';
    var FileName = req.body.name.split("*")[0];
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
    var FileName = req.body.name.split("*")[0];

      res.redirect('dropbox/'+req.params.id);
      //비동기 필요
      // dbxutil.dbx.delete(FileName,FolderID);
  });


  //download - root

  route.post('/download/',function(req,res){
    var FolderID = '';
    console.log(req.body);
    var FileID = req.body.name.split("*")[0];


      //비동기 필요
      dbxutil.dbx.download(FileID,FolderID,req,res);
      // res.redirect('/'+FolderID);
  });

  //download - folder

  route.post('/download/:id',function(req,res){
    var FolderID = '/'+req.params.id.replace(/[*]/g,"/");
    var FileID = req.body.name.split("*")[0];


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
