const createError = require('http-errors');
const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const redis = require('redis');
let RedisStore = require('connect-redis')(session);
let client = redis.createClient();

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const userRouter = require('./routes/user');
const blogRouter = require('./routes/blog');

const ENV = process.env.NODE_ENV;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// setup the session
app.use(session({
  secret: 'Xam_is195#*^0',
  resave: false,
  saveUninitialized: true,
  store: new RedisStore({
    client
  }),
  cookie: {
    // path: '/',  // 默认
    // httpOnly: true,  // 默认
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(express.json());

// create a write stream (in append mode)
const accessLogStream = fs.createWriteStream(path.join(__dirname, './logs', 'access.log'), {
  flags: 'a'
});

// setup the logger
if (ENV === 'dev' || ENV === 'test') {
  app.use(logger('dev'));
} else {
  app.use(logger('combined', {
    stream: accessLogStream
  }));
}

app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
// app.use('/users', usersRouter);
app.use('/api/user', userRouter);
app.use('/api/blog', blogRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'dev' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;