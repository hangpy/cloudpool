var initDropbox = require('./dropbox_init');
var fetch = require('isomorphic-fetch');
var request = require('request');
var usr_session = {}


// app.get('/', (req,res)=>{

    // var query = {
    //   "path": "",
    //   "recursive" : true,
    //   "include_media_info": false,
    //   "include_deleted": false,
    //   "include_has_explicit_shared_members": false,
    //   "include_mounted_folders": true
    // };
    //
    // var data2 = JSON.stringify(query);
    //
    // var headers = {
    //       'Authorization': 'Bearer kFb_ENWtmyUAAAAAAAABfZ-H_JYNRbr1TvWZu-sjyFPVMx2L9yRIiySeTeJMJm0S',
    //       'Content-Type' : 'application/json'
    //   };
    // request.post({
    //   url: 'https://api.dropboxapi.com/2/files/list_folder/get_latest_cursor',
    //   headers : headers,
    //   body : data2
    // },
    //   function(error, response, body){
    //     console.log(body);
    //   }
    // );


    var query = {
      "cursor": "AAFNnFlJIrgBlXl6EdXqIctmF5DgVb3GkpMULgr4q8cA9NO5SWWwBJFXOV_sHk_2W5gwzFRIynUzmR3Y3neO_ra22zC-x363wBlTmIy3cuHI6jyctq8urOzLE30o8rRhVxnybRNwiNDBNHDJobcPqR-sneoNKDZaW1hqB-v-fq4bfw"
    };

    var data = JSON.stringify(query);
    var headers = {
          'Authorization': 'Bearer kFb_ENWtmyUAAAAAAAABfZ-H_JYNRbr1TvWZu-sjyFPVMx2L9yRIiySeTeJMJm0S',
          'Content-Type' : 'application/json'
      };
    request.post({
      url: 'https://api.dropboxapi.com/2/files/list_folder/continue',
      headers : headers,
      body : data
    },
      function(error, response, body){
        console.log(body.entries);
      }
    );
    // dbx.fileRequestsUpdate(query)
    // .then(function(response){
    //     console.log(response);
    //   })
    //   .catch(function (err) {
    //     console.log(err);
    //   });;


// })
