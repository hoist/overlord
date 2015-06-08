'use strict';
var mongoose = require('bluebird').promisifyAll(require('mongoose'));
var config = require('config');
var logger = require('@hoist/logger');
module.exports = {
  connect: function () {
    return mongoose.connectAsync(config.get('Hoist.mongo.overlord'))
      .catch(function (err) {
        logger.error(err);
        process.exit(1);
      });
  },
  disconnect: function () {
    return mongoose.disconnectAsync();
  }
};
