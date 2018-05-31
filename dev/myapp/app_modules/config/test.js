var initBox = require('./box_init');

var usr_session = null;
initBox(usr_session, function(client){
  console.log(client);
})



var Con = function(){

  // setTimeout(function(){
  //
  // }, 1000);
  var b = 'this is b'
  this.a = 'hangbok';
  this.b = function(){
    console.log('a');
    return b;
  }
}


console.log(1);
var con = new Con();
console.log(con.a);
console.log(con.b());
