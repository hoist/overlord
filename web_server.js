'use strict';
var configureServer = require('./lib/web_app/server');
var logger = require('hoist-logger');
var BBPromise = require('bluebird');
var mongoConnection = require('./lib/mongoose_connection');

require("babel/register");

configureServer().then(function (server) {
  mongoConnection.connect().then(function () {
    server.start();
    var gracefullShutdown = function (SIG) {
      logger.info('server stopping');
      return BBPromise.all([
        server.stop(),
        mongoConnection.disconnect()
      ]).then(function () {
        process.kill(process.pid, SIG);
      });
    };
    process.once('SIGUSR2', function () {
      return gracefullShutdown('SIGUSR2');
    });
    process.once('SIGTERM', function () {
      return gracefullShutdown('SIGTERM');
    });
    process.once('SIGINT', function () {
      return gracefullShutdown('SIGINT');
    });
  });
});
