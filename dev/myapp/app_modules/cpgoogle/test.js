initGoogle = require('./google_init');
var usr_session = null;
initGoogle(usr_session, function(oauth2Client){
  console.log(oauth2Client);
})
