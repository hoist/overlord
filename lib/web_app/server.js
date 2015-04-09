'use strict';
var Hapi = require('hapi');
var logger = require('hoist-logger');
var consul = require('consul')();

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
    }).then(function () {
      logger.info('info', server.info);
      consul.agent.service.register({
        name: 'overlord-web',
        tags: ['overlord', 'web', 'nodejs', server.info.protocol],
        port: server.info.port,
        check: {
          script: "curl " + server.info.uri + " >/dev/null 2>&1",
          interval: '10s'
        }
      }, function (err) {
        logger.error(err);
      });
      return server;
    });
};
