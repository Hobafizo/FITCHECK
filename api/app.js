var createError = require('http-errors');
var express = require('express');
var cors = require('cors');
var path = require('path');
const session = require("express-session");
const cookieParser = require("cookie-parser");
var logger = require('morgan');
var dbOp = require('./sql/dbOperations');

var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth');
var usersRouter = require('./routes/users');
var wardrobeRouter = require('./routes/wardrobe');

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
app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/wardrobe', wardrobeRouter);

// Open database connection
dbOp.connect()

// Test email service
/*const email = require('./email/emailservice')

email.SendMailDoc('forget_pw.html', 'mohabfawzy1@gmail.com', 'Muhab Fawzy', 'Forget Password Code',
  [
    { from: '@VerifyCode', to: 'CAA-ATC-ABC' },
  ],
  [
    {
      filename: 'img-02.png',
      path: 'public/images/email/img-02.png',
      cid: 'img-02@fitcheck.com'
    },

    {
      filename: 'facebook-logo-black.png',
      path: 'public/images/email/facebook-logo-black.png',
      cid: 'facebook-logo-black@fitcheck.com'
    },

    {
      filename: 'instagram-logo-black.png',
      path: 'public/images/email/instagram-logo-black.png',
      cid: 'instagram-logo-black@fitcheck.com'
    },

    {
      filename: 'x-logo-black.png',
      path: 'public/images/email/x-logo-black.png',
      cid: 'x-logo-black@fitcheck.com'
    },

    {
      filename: 'youtube-logo-black.png',
      path: 'public/images/email/youtube-logo-black.png',
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