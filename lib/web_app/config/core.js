'use strict';
var config = require('config');
var BBPromise = require('bluebird');
var logger = require('hoist-logger');
module.exports = function (server) {
  return BBPromise.try(function () {
    server.connection({
      host: config.get('Hoist.server.host'),
      port: config.get('Hoist.server.port')
    });
    server.register({
      register: require('hapi-bunyan'),
      options: {
        logger: logger
      }
    }, function (err) {
      if (err) {
        logger.error(err);
      }
    });
  });
};
