var initDropbox = require('./dropbox_init');

var usr_session = {}
initDropbox(usr_session, function(dbx){
  console.log(dbx);
});
