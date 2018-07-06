const path = require('path');
require('dotenv').config({path: path.join(__dirname + '/../../.env')});

module.exports = (function(){
  const REDIS_INFO = {

  };
  return {
    getSessionConfig: function(){
      return LOCAL;
    }
  }
})();
