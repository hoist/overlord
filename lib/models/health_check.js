'use strict';

import BBPromise from 'bluebird';
import connectionManager from './connection_manager';
import {
  Schema
}
from 'mongoose';


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


connectionManager.connection.model('HealthCheck', HealthCheckSchema);
var HealthCheck = connectionManager.connection.model('HealthCheck');
BBPromise.promisifyAll(HealthCheck);
BBPromise.promisifyAll(HealthCheck.prototype);

export default HealthCheck;
