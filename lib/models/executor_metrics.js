'use strict';
var mongoose = require('mongoose');
var BBPromise = require('bluebird');
var Schema = mongoose.Schema;


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


mongoose.model('ExecutorMetrics', ExecutorMetricsSchema);
var ExecutorMetrics = mongoose.model('ExecutorMetrics');
BBPromise.promisifyAll(ExecutorMetrics);
BBPromise.promisifyAll(ExecutorMetrics.prototype);

module.exports = ExecutorMetrics;
