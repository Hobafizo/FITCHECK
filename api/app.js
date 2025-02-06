var createError = require('http-errors');
var express = require('express');
var cors = require('cors');
var path = require('path');
const session = require("express-session");
const cookieParser = require("cookie-parser");
var logger = require('morgan');
var dbOp = require('./sql/dbOperations');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(session({
    secret: "m#4c4^)f9jgmb@*c",
    saveUninitialized: true,
    resave: true
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// Open database connection
dbOp.connect()

// Test email service
/*const email = require('./email/emailservice')

email.SendMailDoc('verify_mail.html', 'mohabfawzy1@gmail.com', 'Muhab Fawzy', 'Welcome to FitCheck - Registration Code',
  [
    { from: '@VerifyCode', to: 'CAA-ATC-ABC' },
  ],
  [
    {
      filename: 'img-01.png',
      path: __dirname + '/public/images/email/img-01.png',
      cid: 'img-01@fitcheck.com'
    },

    {
      filename: 'facebook-logo-black.png',
      path: __dirname + '/public/images/email/facebook-logo-black.png',
      cid: 'facebook-logo-black@fitcheck.com'
    },

    {
      filename: 'instagram-logo-black.png',
      path: __dirname + '/public/images/email/instagram-logo-black.png',
      cid: 'instagram-logo-black@fitcheck.com'
    },

    {
      filename: 'x-logo-black.png',
      path: __dirname + '/public/images/email/x-logo-black.png',
      cid: 'x-logo-black@fitcheck.com'
    },

    {
      filename: 'youtube-logo-black.png',
      path: __dirname + '/public/images/email/youtube-logo-black.png',
      cid: 'youtube-logo-black@fitcheck.com'
    },
  ]
)*/

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

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