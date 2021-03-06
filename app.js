/* global app */
/// <reference path="typings/node/node.d.ts"/>
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var multer = require('multer');
var fs = require('fs');
var config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
var LOGGER = require('./logger.js'); 

app = express();

//development vs. production
//in development mode, stack traces are visible on the Web page
app.set('env', config["env"]);
LOGGER.info('Web app environment: ' + app.get('env')+ ' (note: only the \"development\" environment shows stack traces client-side)');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));

var routes = require('./routes/all');
app.use('/', routes);

app.config = config;

//create a default ranking for development purposes
var ranking = require('./ranking.js').ranking;
app.ranking = ranking;
app.ranking.loadFromBackup();

var geoAccuracy = require('./geoAccuracy.js').geoAccuracy;
geoAccuracy.initLocaleEval();
geoAccuracy.initMobilityEval();
app.geoAccuracy = geoAccuracy;

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
    LOGGER.error(err.status + ": " + err.message);
  });
}

  // production error handler
  // no stacktraces leaked to user
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: "",
      error: {}
    });
  });



module.exports = app;
