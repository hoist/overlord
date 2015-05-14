'use strict';
var AWS = require('aws-sdk');
var config = require('config');
var BBPromise = require('bluebird');
var _ = require('lodash');
var logger = require('hoist-logger');
var moment = require('moment');
var url = require('url');
var request = require('request-promise');

AWS.config.update({
  accessKeyId: config.get('Hoist.aws.account'),
  secretAccessKey: config.get('Hoist.aws.secret'),
  region: config.get('Hoist.aws.region')
});


var cloudWatch = BBPromise.promisifyAll(new AWS.CloudWatch());


function pollQueues() {
  var rabbitUrl = url.parse(config.get('Hoist.rabbit.managementurl'));
  rabbitUrl.pathname = '/api/queues';
  return request.get(url.format(rabbitUrl), {
      json: true
    })
    .then(function (response) {
      return _.filter(response, function (queue) {
        return _.startsWith(queue.name, 'run_module_');
      });
    }).then(function (queues) {
      return queues;
    })
    .then(function (queues) {
      var metricTimeStamp = moment().toISOString();
      var MetricData = [];
      MetricData.push({
        MetricName: 'queues',
        Unit: 'Count',
        Timestamp: metricTimeStamp,
        Value: queues.length
      });
      MetricData.push({
        MetricName: 'messages',
        Unit: 'Count',
        Timestamp: metricTimeStamp,
        Value: _.reduce(_.map(queues, function (queue) {
          /*jshint camelcase: false */
          return queue.messages_ready;
        }), function (sum, n) {

          return sum + n;
        })
      });
      MetricData.push({
        MetricName: 'consumerless_queue',
        Unit: 'Count',
        Timestamp: metricTimeStamp,
        Value: _.filter(queues, function (queue) {
          return queue.consumers === 0;
        }).length
      });

      logger.info({
        metricData: MetricData
      }, 'logging metrics');

      return cloudWatch.putMetricDataAsync({
        Namespace: "HOIST/APPLICATIONQUEUES",
        MetricData: MetricData
      });

    }).catch(function (err) {
      logger.error(err);
    });
}

module.exports = pollQueues;
