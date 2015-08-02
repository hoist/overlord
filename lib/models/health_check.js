'use strict';
var mongoose = require('mongoose');
var BBPromise = require('bluebird');
var Schema = mongoose.Schema;


var HealthCheckSchema = new Schema({
  instances: [{
    instanceId: {
      type: String
    },
    failedChecks: {
      type: Number,
      default: 0
    },
    passedChecks: {
      type: Number,
      default: 0
    },
    currentState: {
      type: String,
      default: 'healthy'
    },
    failedSince: {
      type: Date
    }
  }]
}, {
  read: 'nearest'
});


mongoose.model('HealthCheck', HealthCheckSchema);
var HealthCheck = mongoose.model('HealthCheck');
BBPromise.promisifyAll(HealthCheck);
BBPromise.promisifyAll(HealthCheck.prototype);

module.exports = HealthCheck;
