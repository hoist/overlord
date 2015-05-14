'use strict';
var config = require('config');
var BBPromise = require('bluebird');
var logger = require('hoist-logger');
var Poop = require('poop');
var Path = require('path');
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
    server.register({
      register: Poop,
      options: {
        logPath: Path.join(process.cwd(), 'poop.log')
      }
    }, function (err) {
      if (err) {
        logger.error(err);
      }

    });
  });
};
