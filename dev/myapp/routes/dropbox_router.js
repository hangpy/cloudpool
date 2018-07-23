module.exports = function(){
  var router = require('express').Router();
  var fs = require('fs');
  var dbxutil=require('../app_modules/cpdropbox/dropbox_util');
  var formidable = require('formidable');
  var bodyParser = require('body-parser');
  var dbx_init = require('../app_modules/cpdropbox/dropbox_init');
  /* module required to get authentication from dropbox */
  const dropbox_client = require('../app_modules/config/client_info').DROPBOX;
  const knex = require('../app_modules/db/knex');
  const url = require('url');
  const request = require('request');
  const dropbox_auth = require('../app_modules/cpdropbox/dropbox_auth')();


  //list - root
  router.get('/folder', (req,res)=>{
      var folderID = '';
      console.log("read folder/");
        dbxutil.getlistRest(req.user.userID, folderID, function(filelist){
          res.render('dropbox_list',{
              FolderID : '',
              filelist: filelist
          });
        })


  });

  //list - folder
  //%25
  router.get('/folder/:id', (req,res)=>{
      console.log("-------------------------------read folder/id");
    if(req.params.id.includes('%25')){
      var name = req.params.id.replace("%25","%");
    }
    else name = req.params.id
    console.log(name);
    var folderID = '/'+name.replace(/[*]/g,"/");
    dbxutil.getlistRest(req.user.userID, folderID, function(filelist){
      res.render('dropbox_list',{
          FolderID : req.params.id,
          filelist : filelist
      });
    })

  });

  //search list view - root
  router.post('/searchview/folder/', (req,res)=>{
      var folderID = '';
      console.log("read search folder/");
      console.log(req.body.obj);
      var searchfilelist = JSON.parse(req.body.obj);
      res.render('dropbox_list',{
            FolderID : '',
            filelist: searchfilelist
      });
  });

  //search list view - folder

  //%25
  router.post('/searchview/folder/:id', (req,res)=>{
      console.log("read folder/id");
    // if(req.params.id.includes('%25')){
    //   var name = req.params.id.replace("%25","%");
    // }
    // else
    var name = req.params.id
    var folderID = '/'+name.replace(/[*]/g,"/");
    var searchfilelist = JSON.parse(req.body.obj);
    res.render('dropbox_list',{
          FolderID : req.params.id,
          filelist: searchfilelist
    });
  });


  //select list - root
  router.post('/selectview/folder/', (req,res)=>{
      var folderID = '';
      console.log("read search folder/");
      var searchfilelist = JSON.parse(req.body.obj);
      res.render('dropbox_list',{
            FolderID : '',
            filelist: searchfilelist
      });
  });

  //select list - folder
  //%25
  router.post('/selectview/folder/:id', (req,res)=>{
      console.log("read folder/id");
    // if(req.params.id.includes('%25')){
    //   var name = req.params.id.replace("%25","%");
    // }
    // else
    var name = req.params.id
    var folderID = '/'+name.replace(/[*]/g,"/");
    var searchfilelist = JSON.parse(req.body.obj);
    res.render('dropbox_list',{
          FolderID : req.params.id,
          filelist: searchfilelist
    });
  });



  //rename - root

  router.post('/rename/',function(req,res){
    var FolderID = '';
    var originName = req.body.originname;
    var type = originName.split(".")[1];
    var newName = req.body.newname+"."+type;
    console.log("rename name : " +req.user.userID);
    dbxutil.sendrenameRest(req.user.userID, newName, originName, FolderID, function(result){
      if(result =="finish_rename_the_file"){
        res.json("finish");
      }
      else{
        res.json("error");
      }
    })
  });

  //rename -folder

  router.post('/rename/:id',function(req,res){
    var FolderID = '/'+req.params.id.replace(/[*]/g,"/");
    var originName = req.body.originname;
    var type = originName.split(".")[1];
    var newName = req.body.newname+"."+type;
    dbxutil.sendrenameRest(req.user.userID, newName, originName, FolderID, function(result){
      if(result =="finish_rename_the_file"){
        res.json("finish");
      }
      else{
        res.json("error");
      }
    })
  });

  //search - root

  router.post('/search/',function(req,res){
    var FolderID = '';
    var searchname = req.body.searchname;
    var searchFolder = req.body.searchfolder;
    dbxutil.sendsearchRest(req.user.userID, searchname, searchFolder, FolderID, function(result){
        res.json(result);
    })
  });

  //search -folder

  router.post('/search/:id',function(req,res){
    var FolderID = '/'+req.params.id.replace(/[*]/g,"/");
    var searchname = req.body.searchname;
    var searchFolder = req.body.searchfolder;
    var searchtype = req.body.searchtype;
    dbxutil.sendsearchRest(req.user.userID, searchname, searchFolder, searchtype, FolderID, function(result){
        res.json(result);
    })
  });

  //select - root

  router.post('/select/',function(req,res){
    var FolderID = '';
    var selecttype = req.body.selecttype;
    dbxutil.sendsearchtypeRest(req.user.userID, selecttype, FolderID, function(result){
        res.json(result);
    })
  });

  //select -folder

  router.post('/select/:id',function(req,res){
    var FolderID = '/'+req.params.id.replace(/[*]/g,"/");
    var selecttype = req.body.selecttype;
    dbxutil.sendsearchtypeRest(req.user.userID, selecttype, FolderID, function(result){
        res.json(result);
    })
  });

  //delete - root

  router.post('/delete/',function(req,res){
    var Splitname = req.body.name.split("*");
    console.log(Splitname);
    var FileID = Splitname[Splitname.length-1];
    for(var i = 0; i < Splitname.length-1 ; i++){
      if(i==0){
      var FolderID = Splitname[i];
      }
      else FolderID = FolderID +"/"+ Splitname[i];
    }
    if(FolderID ==undefined){
      FolderID='';
    }
    dbx_init(req.user, function(client){
        dbxutil.delete(client, FileID,FolderID, req.user.userID, function(result){
          res.json(result);
        });
    })
  });





  router.post('/download/',function(req,res){
    // var FolderID = '';
    var Splitname = req.body.name.split("*");
    console.log(Splitname);
    var FileID = Splitname[Splitname.length-1];
    for(var i = 0; i < Splitname.length-1 ; i++){
      if(i==0){
      var FolderID = Splitname[i];
      }
      else FolderID = FolderID +"/"+ Splitname[i];
    }
    if(FolderID ==undefined){
      FolderID='';
    }
    console.log(FolderID);
    dbx_init(req.user, function(client){
        dbxutil.download(client, FileID,FolderID,req,res);
    })
  });


  //upload - root

  router.post('/upload/',function(req,res){
    var FolderID = '';
    var form = new formidable.IncomingForm();

    form.parse(req, function(err, fields, files) {

      var FileInfo = files.uploads_list;
      // console.log(FileInfo);
      // res.redirect('/'+FolderID);
      //비동기 필요
      dbx_init(req.user, function(client){
          dbxutil.upload(client, FileInfo, FolderID,res);
      })

    });
  });

  //upload - folder
  router.post('/upload/:id',function(req,res){
    var folderID = '/'+req.params.id.replace(/[*]/g,"/");

    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {

      var FileInfo = files.uploads_list;
      // res.redirect('/'+req.params.id);
      //비동기 필요
      dbx_init(req.user, function(client){
          dbxutil.upload(client, FileInfo,FolderID);
      })

    });
  });

  /* insert user access token into database */
  // router to accept what dropbox responsed against user's request for authentication
  router.get('/callback', function(req, res) {
    if (req.query.error) {
      return res.send('ERROR ' + req.query.error + ': ' + req.query.error_description);
    }
    if (req.query.state !== req.cookies.csrf) {
      return res.status(401).send(
        'CSRF token mismatch, possible cross-site request forgery attempt.'
      );
    }
    request.post('https://api.dropbox.com/1/oauth2/token', {
      form: {
        code: req.query.code,
        grant_type: 'authorization_code',
        redirect_uri: dropbox_auth.generateRedirectURI(req)
      },
      auth: {
        user: dropbox_client.getClientId(),
        pass: dropbox_client.getClientSecret()
      }
    },
    function(error, response, body) {
      var data = JSON.parse(body);
      if (data.error) {
        return res.send('ERROR: ' + data.error);
      }
      const USER_ACCESS_TOKEN = data.access_token;


      // insert token into database
      knex('DROPBOX_CONNECT_TB').insert({
        userID: req.user.userID,
        accessToken_d: USER_ACCESS_TOKEN,
      }).then(function() {
        // req.session.token = data.access_token;
        request.post('https://api.dropbox.com/1/account/info', {
          headers: {
            Authorization: 'Bearer ' + USER_ACCESS_TOKEN
          }
        });
        // final working after all process of authentication without any errors
        // res.send('Logged in successfully as ' + JSON.parse(body).access_token + '.');

        //register REST API server
        data = {
          "user_id" : req.user.userID,
          "CP_love" : USER_ACCESS_TOKEN
        };
        request.post(  {
          url: 'http://localhost:4000/api/dropbox/set/',
          body : data,
          json : true
        },
          function(error, response, body){
          console.log("Complete register rest API Server");
        });

        res.redirect("/");
      }).catch(function(err) {
        console.log(err);
        res.status(500);
      });
    });
  });

  // router when general user use function enrolling authentication about dropbox
  router.get('/token', function(req, res) {
    var csrfToken = dropbox_auth.generateCSRFToken();
    res.cookie('csrf', csrfToken);
    res.redirect(url.format({
      protocol: 'https',
      hostname: 'www.dropbox.com',
      pathname: '1/oauth2/authorize',
      query: {
        client_id: dropbox_client.getClientId(), //App key of dropbox api
        response_type: 'code',
        state: csrfToken,
        // redirect_uri must be matched with one of enrolled redirect url in dropbox
        redirect_uri: dropbox_auth.generateRedirectURI(req)
      }
    }));
  });


  //send for refresh the user file list
  router.get('/refresh', function(req, res) {
    var user_id = req.user.userID;
    console.log("Get in the refresh router");
    var FolderDir = '';
    dbxutil.getrefreshRest(user_id, FolderDir, function(result){
      res.json(result);
    });
  });

  router.post('/move/', function(req, res){
    console.log("======move route===========");
    var fromFile = req.body.filename;
    var toFolder = req.body.toFolder;
    dbxutil.movefileRest(req.user.userID, fromFile, toFolder, function(result){
      if(result =="finish_move_the_file"){
        res.json("finish");
      }
      else{
        res.json("error");
      }
    })
  });

  router.post('/makeFolder/', function(req, res){
    console.log("======makeFolder route===========");
    var foldername = req.body.foldername;
    console.log(foldername);
    dbxutil.makeFolderRest(req.user.userID, foldername, function(result){
      if(result =="finish_makefolder_the_file"){
        res.json("finish");
      }
      else{
        res.json("error");
      }
    })
  });

  return router;
}
// module.exports = route;
