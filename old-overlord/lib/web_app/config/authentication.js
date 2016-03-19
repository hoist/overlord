'use strict';
var config = require('config');
var logger = require('@hoist/logger');
var APIToken = require('../../models/api_token');
module.exports = function (server) {
  server.register(require('hapi-auth-cookie'), (err) => {
    if (err) {
      logger.error(err);
      logger.alert(err);
      return;
    }
    server.auth.strategy('session', 'cookie', {
      password: config.get('Hoist.cookies.overlord.password'),
      cookie: config.get('Hoist.cookies.overlord.name'),
      redirectTo: '/session/create',
      isSecure: config.get('Hoist.cookies.overlord.secure')
    });
  });
  server.register(require('hapi-auth-bearer-token'), (err) => {
    if (err) {
      logger.error(err);
      logger.alert(err);
      return;
    }
    server.auth.strategy('token', 'bearer-access-token', {
      accessTokenName: 'api_token',
      validateFunc: (token, callback) => {
        logger.debug({
          token: token
        }, 'finding token');
        APIToken.findOneAsync({
          token: token
        }).then((apiToken) => {
          logger.debug({
            token: apiToken
          }, 'loaded token');
          if (apiToken) {
            return callback(null, true, apiToken.toObject());
          }
          return callback(null, false);
        }).catch((validateErr) => {
          logger.err(validateErr);
          callback(validateErr);
        });
      }
    });
  });
};
