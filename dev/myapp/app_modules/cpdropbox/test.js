var initDropbox = require('./dropbox_init');
var fetch = require('isomorphic-fetch');
var request = require('request');
var usr_session = {}


app.get('/', (req,res)=>{
  initDropbox(usr_session, function(dbx){
    var query = {"path": "/test.ppt"};

    var data = JSON.stringify(query);
          var headers = {
              'Authorization': 'Bearer ' + dbx.accessToken,
              'Dropbox-API-Arg' : data
          };
    request.post({
      url: 'https://content.dropboxapi.com/2/files/get_preview',
      headers : headers
      // body : data
    },
      function(error, response, body){
        console.log(body);
      }
    );

    // dbx.fileRequestsUpdate(query)
    // .then(function(response){
    //     console.log(response);
    //   })
    //   .catch(function (err) {
    //     console.log(err);
    //   });;

  });
})
