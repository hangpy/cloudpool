var router = require('express').Router();


module.exports = function() {


  router.get('/', function(req, res){
    res.render('dashboard',{

    });
  });



  return router;
}
