'use strict';
var mongoose = require('bluebird').promisifyAll(require('mongoose'));
var mongoose2 = require('@hoist/model')._mongoose;
var config = require('config');
var logger = require('@hoist/logger');
module.exports = {
  connect: function () {
    Model._mongoose.set('debug', true);
    return mongoose.connectAsync(config.get('Hoist.mongo.overlord'))
      .then(function() {
        return mongoose2.createConnectionAsync(config.get('Hoist.mongo.portal'));
      }).catch(function (err) {
        logger.error(err);
        process.exit(1);
      });
  },
  disconnect: function () {
    return mongoose.disconnectAsync().then(function() {
      return mongoose2.disconnectAsync();
    });
  }
};
