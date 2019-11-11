const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const http = require('http-status-codes');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/users', usersRouter);
app.use('/', indexRouter);

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(http.NOT_FOUND));
});

// Error handler
app.use((err, req, res) => {
  const { errMessage } = res;

  // Set locals, only providing error in development
  res.locals.message = errMessage;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page
  res.status(err.status || http.INTERNAL_SERVER_ERROR);
  res.render('error');
});

module.exports = app;

const { Promise } = global;

mongoose.Promise = Promise;
mongoose.connect('mongodb://localhost/3000', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('khoroshee ololo'))
  .catch(() => console.log('hrenovoe ololo'));
