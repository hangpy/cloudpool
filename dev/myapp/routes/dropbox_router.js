module.exports = function(){

  var route = require('express').Router();
  var fs = require('fs');
  var dbxutil=require('../app_modules/cpdropbox/dropbox_util.js');
  var formidable = require('formidable');
  var bodyParser = require('body-parser');

  /* module required to get authentication from dropbox */
  const dropbox_client = require('../app_modules/config/client_info').DROPBOX;
  const knex = require('../app_modules/db/knex');
  const url = require('url');
  const request = require('request');
  const dropbox_auth = require('../app_modules/cpdropbox/dropbox_auth')();



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

<<<<<<< HEAD
  //search list view - folder
=======
  route.get('/folder/:id', (req,res)=>{
>>>>>>> 2d0cbcab4ca5733a0b866ce4e3cb111474f6660b

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



  // 이항복으로부터 추가 지우지 말것
  /* 이미 인증 되어있는데 또 요구시 메시지 */
  /* insert user access token into database */
  // router to accept what dropbox responsed against user's request for authentication
  route.get('/callback', function(req, res) {
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
        res.redirect("/");
      }).catch(function(err) {
        console.log(err);
        res.status(500);
      });
    });
  });

  // router when general user use function enrolling authentication about dropbox
  route.get('/token', function(req, res) {
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


  return route;
}
// module.exports = route;
