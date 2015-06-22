'use strict';
var AWS = require('aws-sdk');
var config = require('config');
var BBPromise = require('bluebird');
var _ = require('lodash');
var logger = require('@hoist/logger');

AWS.config.update({
  accessKeyId: config.get('Hoist.aws.account'),
  secretAccessKey: config.get('Hoist.aws.secret'),
  region: config.get('Hoist.aws.region')
});
var ec2 = BBPromise.promisifyAll(new AWS.EC2());

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
    return instances;
  }).then(function (executorInstances) {
    if (executorInstances.length > 0) {
      logger.info({
        instances: executorInstances
      }, 'rebooting instances');
      return ec2.rebootInstancesAsync({
        InstanceIds: executorInstances
      });
    }
  }).catch(function (err) {
    logger.alert(err);
    logger.error(err);
  });
}
module.exports = pollEC2;
