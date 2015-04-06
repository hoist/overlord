'use strict';
var AWS = require('aws-sdk');
var config = require('config');
var BBPromise = require('bluebird');
var _ = require('lodash');
var moment = require('moment');
var logger = require('hoist-logger');

AWS.config.update({
  accessKeyId: config.get('Hoist.aws.account'),
  secretAccessKey: config.get('Hoist.aws.secret'),
  region: config.get('Hoist.aws.region')
});
var ec2 = BBPromise.promisifyAll(new AWS.EC2());
var cloudWatch = BBPromise.promisifyAll(new AWS.CloudWatch());

function getCloudwatchStats(instanceId) {
  var now = moment();
  var startTime = moment().subtract(10, 'minutes');
  var statQuery = {
    EndTime: now.toISOString(),
    MetricName: 'CPUCreditBalance',
    Statistics: ['Average'],
    StartTime: startTime.toISOString(),
    Period: 300,
    Namespace: 'AWS/EC2',
    Dimensions: [{
      Name: 'InstanceId',
      Value: instanceId
    }]


  };
  logger.info({
    query: statQuery
  }, 'querying metrics');
  return cloudWatch.getMetricStatisticsAsync(statQuery).then(function (data) {
    logger.info({
      data: data
    }, 'got stats');

    if (data.Datapoints.length) {
      if (data.Datapoints[0].Average < 2) {
        //kill instance here
        logger.info('instance ' + instanceId + ' has ' + data.Datapoints[0].Average + ' CPU credits');
        return instanceId;
      }
    }
    return null;

  });
}

function pollEC2() {
  return ec2.describeInstancesAsync({
    Filters: [{
      Name: 'instance-state-name',
      Values: ['running']
    }, {
      Name: 'tag:aws:autoscaling:groupName',
      Values: ['executors']
    }]
  }).then(function (data) {
    var instances = _.flatten(_.map(data.Reservations, function (reservation) {
      return _.flatten(_.map(reservation.Instances, function (instance) {
        return instance.InstanceId;
      }));
    }));
    logger.info({
      instances: instances
    }, 'got instances');
    return BBPromise.all(_.map(instances, getCloudwatchStats));
  }).then(function (instancesToKill) {
    instancesToKill = _.filter(instancesToKill, function (instance) {
      return instance;
    });
    if (instancesToKill.length > 0) {
      logger.info({
        instances: instancesToKill
      }, 'killing instances');
      /*return ec2.terminateInstancesAsync({
        InstanceIds: instancesToKill
      });*/
    }
  }).catch(function (err) {
    logger.alert(err);
    logger.error(err);
  });
}
module.exports = pollEC2;
