'use strict';
import BBPromise from 'bluebird';
import connectionManager from './connection_manager';
import {
  Schema
}
from 'mongoose';


var ExecutorMetricsSchema = new Schema({
  measurements: [{
    timestamp: {
      type: Date
    },
    executorCount: {
      type: Number
    },
    queueCount: {
      type: Number
    },
    queues: [{
      name: {
        type: String
      },
      messagesReady: {
        type: Number
      },
      consumers: {
        type: Number
      }
    }]

  }]
}, {
  read: 'nearest'
});


connectionManager.connection.model('ExecutorMetrics', ExecutorMetricsSchema);
var ExecutorMetrics = connectionManager.connection.model('ExecutorMetrics');
BBPromise.promisifyAll(ExecutorMetrics);
BBPromise.promisifyAll(ExecutorMetrics.prototype);

export default ExecutorMetrics;
