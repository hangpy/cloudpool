var dbutil = require('./db_util');
var dbcon = require('./db_con');

dbcon.init(function(conn){
  dbutil.testConnection(conn);
})
