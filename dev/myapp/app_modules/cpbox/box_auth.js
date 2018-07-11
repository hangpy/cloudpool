module.exports = function() {
  var BoxSDK = require('box-node-sdk');
  const client_info = require('../config/client_info');
  const box_client = client_info.BOX;

  const CLIENT_ID = box_client.getClientId(),
        CLIENT_SECRET = box_client.getClientSecret(),
        REDIRECT_URL = box_client.getRedirectUrl();

  var sdk = new BoxSDK({
    clientID: CLIENT_ID, // required
    clientSecret: CLIENT_SECRET // required
  });
  var USER_ACCESS_TOKEN='cM5beHcMQ1x1sWo8Gx8xDiCV8JlAFUOI';
  // Create a basic API client
  var client = sdk.getBasicClient(USER_ACCESS_TOKEN);


  client.users.get(client.CURRENT_USER_ID, null, function(err, info){
    if(err)console.log(err);
    else{
      console.log("used : "+ info.space_used);
      console.log("Total : "+ info.space_amount);

    }
  });

  return client;
}
