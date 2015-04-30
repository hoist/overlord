'use strict';
var configureServer = require('./lib/web_app/server');
var logger = require('hoist-logger');


configureServer().then(function (server) {
  server.start();
  process.on('SIGTERM', function () {
    logger.info('server stopping');
    server.stop();
  });
  process.on('SIGINT', function () {
    logger.info('server stopping');
    server.stop();
  });
});
