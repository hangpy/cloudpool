const path = require('path');
const redis = require('redis');
require('dotenv').config({path: path.join(__dirname + '/../../.env')});

module.exports = (function(){

  const redis_client = redis.createClient(
    process.env.REDIS_PORT,
    process.env.REDIS_HOST
  );

  return redis_client;
})();
