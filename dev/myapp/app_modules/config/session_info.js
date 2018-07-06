const path = require('path');
require('dotenv').config({path: path.join(__dirname + '/../../.env')});

module.exports = (function(){
  const SESSION_CONFIG = {

  };
  return {
    getSessionConfig: function(){
      return LOCAL;
    }
  }
})();
