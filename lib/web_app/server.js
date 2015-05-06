'use strict';
var Hapi = require('hapi');
var logger = require('hoist-logger');

module.exports = function () {
  var server = new Hapi.Server();
  logger.info('core config');
  return require('./config/core')(server)
    .then(function () {
      logger.info('view config');
      return require('./config/views')(server);
    }).then(function () {
      logger.info('route config');
      return require('./config/routes')(server);
    }).then(function(){
      logger.info('authentication config');
      return require('./config/authentication')(server);
    }).then(function () {
      logger.info('info', server.info);
      return server;
    });
};
