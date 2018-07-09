
const knex = require('../db/knex');




// knex('USER_INFO_TB').insert({
//   userName: "hangbok",
//   email: "leehangbok2009@gmail.com",
//   salt:"afasdfasdf",
//   password: "sadfasdfd"
// }).then(console.log);

knex.select().from('USER_INFO_TB').then(console.log);




//
// console.log(sql);
// console.log(
//   knex({ a: 'table', b: 'table' })
// .select({
//   aTitle: 'a.title',
//   bTitle: 'b.title'
// })
// )
