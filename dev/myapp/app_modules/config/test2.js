var bkfd2Password = require("pbkdf2-password");

var hasher = bkfd2Password();
hasher({password:'1234', salt :'ZDxQ5a+KNXwmtJdm0YnZanarjAb3tVRxMrKD7Dl8a6/fuwb8kulV3LE346RrUkDqAlqRNEFGM9mzMRlG3IXaHQ=='}, function(err, pass, salt, hash){
  console.log(hash);


});
//
//
// serializeUser { user_ID: 'local:test2',
//   password: 'b/vHb3TlvMhPJh22x/MC9Z2Rbpmhd7k5fC1D3ZWd7v9+tfWejy0yl3goVGDn0FMSXYFTGbcqNfLWicAWsHs3BDqjPWbCBOrQve+95z/oKSIOkQGSR51fD3EiddR4+w+S3GymKEe56blCroJ3F3Y/LWGOljrS6fXA6JiFKgnDGuA=',
//   username: 'test',
//   salt: 'EMAIxsGw37JxzMKd1E7pBEQTaYtaZhzmm09Cps+3cvxhBokZGNTl13JIFPzIjhMMCxcEAqXTUn+Z/ryD3ITqTw==' }
//
//
//   salt : 123
// hash : F+VzrJ4KNG+XxzdfswUMq8D7NNKz6Bl3PUmbLr6H0fDG1IjoVA7OIh3ZpS2EoCXwon0HGGH3TbgwCm24GNUQixtLGoCwallO80aOkEMI7uKyH3GaaFrFjkooMK6jZbAMF9OZpN2SwcoyKn50gabbZ27hb2wI39TxAULyWqL25cI=
// password  : b/vHb3TlvMhPJh22x/MC9Z2Rbpmhd7k5fC1D3ZWd7v9+tfWejy0yl3goVGDn0FMSXYFTGbcqNfLWicAWsHs3BDqjPWbCBOrQve+95z/oKSIOkQGSR51fD3EiddR4+w+S3GymKEe56blCroJ3F3Y/LWGOljrS6fXA6JiFKgnDGuA=
