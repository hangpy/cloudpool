var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var sassMiddleware = require('node-sass-middleware');
var app = express();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var box = require('./routes/box_router');
var dropbox = require('./routes/dropbox_router')();
var google = require('./app_modules/cpgoogle/google_router');
var bodyParser = require('body-parser');
var session = require('express-session');


// required parts to initialize passport and passport session.
// make passport object
var passport = require('passport');
// set the passport object
require('./app_modules/cpauth/passport')(passport);
// deliver set passport to router for authentication
var authRouter = require('./app_modules/cpauth/cp_auth')(passport);


app.use(bodyParser.urlencoded({ extended: false }));
app.use('/google/', google);

 app.use('/dropbox/',dropbox);
// app.get('/dropbox/', (req,res)=>{
//     console.log("여기까지 온다");
//
// });



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// middleware setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true, // true = .sass and false = .scss
  sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'cat',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// controllers setup
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth/', authRouter);
app.use('/google/', google);
app.use('/box/', box);


// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
