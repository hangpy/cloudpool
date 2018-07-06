module.exports = (function(){
  const config = require('../config/db_info');

  const knex = require('knex')({
    client: 'mysql',
    version: '8.0',
    connection: {
      host: config.getLocalPoolConfig().host,
      user: config.getLocalPoolConfig().user,
      password: config.getLocalPoolConfig().password,
      database: config.getLocalPoolConfig().database,
      charset: config.getLocalPoolConfig().charset
    }
  });
  return knex;
})();
