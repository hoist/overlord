'use strict';
var mongoose = require('bluebird').promisifyAll(require('mongoose'));
var config = require('config');
module.exports = {
  connect: function () {
    return mongoose.connectAsync(config.get('Hoist.mongo.overlord'));
  },
  disconnect: function () {
    return mongoose.disconnectAsync();
  }
};
