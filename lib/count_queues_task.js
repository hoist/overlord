'use strict';
var AWS = require('aws-sdk');
var config = require('config');
var BBPromise = require('bluebird');
var _ = require('lodash');
var logger = require('hoist-logger');
var moment = require('moment');
AWS.config.update({
  accessKeyId: config.get('Hoist.aws.account'),
  secretAccessKey: config.get('Hoist.aws.secret'),
  region: config.get('Hoist.aws.region')
});

var sqs = BBPromise.promisifyAll(new AWS.SQS());
var cloudWatch = BBPromise.promisifyAll(new AWS.CloudWatch());

function getQueueCount(url) {
  return BBPromise.try(function () {
    logger.info({
      queue: url
    }, 'getting queue stats');
  }).then(function () {
    return sqs.getQueueAttributesAsync({
      QueueUrl: url,
      AttributeNames: ['All']
    });
  }).then(function (data) {
    logger.info('parsing for count');
    var number = _.parseInt(data.Attributes.ApproximateNumberOfMessages);
    return number;
  }).catch(function (err) {
    logger.error(err);
    return 0;
  });
}

function pollQueues() {
  return sqs.listQueuesAsync({
    QueueNamePrefix: config.get('Hoist.aws.prefix') + 'run_module_application_'
  }).then(function (data) {

    return BBPromise.all(
      _.map(data.QueueUrls, getQueueCount)
    );
  }).then(function (counts) {
    var metricTimeStamp = moment().toISOString();
    var MetricData = [];
    MetricData.push({
      MetricName: 'queues',
      Unit: 'Count',
      Timestamp: metricTimeStamp,
      Value: counts.length
    });
    MetricData.push({
      MetricName: 'messages',
      Unit: 'Count',
      Timestamp: metricTimeStamp,
      Value: _.reduce(counts, function (sum, n) {
        return sum + n;
      })
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
