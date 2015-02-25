'use strict';
var url = require('url');
var config = require('config');
var request = require('request-promise');
var AWS = require('aws-sdk');
var logger = require('hoist-logger');
var _ = require('lodash');
var BBPromise = require('bluebird');

AWS.config.update({
  accessKeyId: config.get('Hoist.aws.account'),
  secretAccessKey: config.get('Hoist.aws.secret'),
  region: config.get('Hoist.aws.region')
});

var ec2 = BBPromise.promisifyAll(new AWS.EC2());
var autoscaling = BBPromise.promisifyAll(new AWS.AutoScaling());

function getQueues() {
  var rabbitUrl = url.parse(config.get('Hoist.rabbit.managementurl'));
  rabbitUrl.pathname = '/api/queues';
  return request.get(url.format(rabbitUrl), {
      json: true
    })
    .then(function (response) {
      return _.filter(response, function (queue) {
        return _.startsWith(queue.name, 'run_module_');
      });
    });
}

function getConsumersForQueues(queues) {
  return BBPromise.try(function () {
    return BBPromise.all(
      _.map(queues, function (queue) {
        var rabbitUrl = url.parse(config.get('Hoist.rabbit.managementurl'));
        rabbitUrl.pathname = '/api/queues/' + encodeURIComponent(queue.vhost) + '/' + encodeURIComponent(queue.name);
        return request.get(url.format(rabbitUrl), {
            json: true
          })
          .then(function (response) {
            /*jshint camelcase:false*/
            return _.pluck(response.consumer_details, 'channel_details');
          });
      })
    );
  });

}

function setScaleMinAndMax(queueCount) {
  var autoScaleConfig = {
    MinSize: queueCount,
    MaxSize: queueCount * 10,
    AutoScalingGroupName: 'executors'
  };
  logger.info({
    config: autoScaleConfig
  }, 'updating autoscaling config');
  return autoscaling.updateAutoScalingGroupAsync(autoScaleConfig).then(function (data) {
    logger.info({
      data: data
    }, 'auto scaling group');
  });
}

function killExecutor(privateIp) {
  return ec2.describeInstancesAsync({
    Filters: [{
      Name: 'private-ip-address',
      Values: [privateIp]
    }],

  }).then(function (result) {
    var instanceToKill = result.Reservations[0].Instances[0].InstanceId;
    logger.info({
      instance: instanceToKill
    }, 'killing instance');
    return ec2.terminateInstancesAsync({
      InstanceIds: [instanceToKill]
    });
  });
}

function rebalance() {
  //get queue stats
  console.log('getting queues');
  return getQueues().
  then(function (queues) {
    var messageCount = _.reduce(_.pluck(queues, 'messages_ready'), function (sum, n) {
      return sum + n;
    });
    console.log(messageCount);
    console.log('parsing queues');
    //ensure minimum executors is the same as number of queues
    //setting new AutoScalingParams
    return setScaleMinAndMax(queues.length, messageCount)
      .then(function () {

        var queuesThatHaveNoConsumers = _.filter(queues, function (queue) {
          return queue.consumers === 0;
        });
        logger.info({
          queues: _.pluck(queuesThatHaveNoConsumers, 'name')
        }, 'do we have any queues that need consumers?');
        var queuesWithTooFewConsumers = _.filter(queues, function (queue) {
          /* jshint camelcase:false */
          return queue.consumers > 0 && queue.consumers < 10 && ((queue.consumers / queue.messages_ready) < 0.001);
        });
        logger.info({
          queues: _.pluck(queuesWithTooFewConsumers, 'name')
        }, 'do we have any queues that have too few consumers?');
        var queuesWithTooManyConsumers = _.filter(queues, function (queue) {
          /* jshint camelcase:false */
          return queue.consumers > 10 || (queue.consumers > 2 && ((queue.consumers / queue.messages_ready) > 0.001));
        });
        logger.info({
          queues: _.pluck(queuesWithTooManyConsumers, 'name')
        }, 'do we have any queues that have too many consumers?');

        if (queuesThatHaveNoConsumers.length > 0 || queuesWithTooFewConsumers.length > 0) {
          logger.info('we need to add consumers');
          if (queuesWithTooManyConsumers.length > 0) {
            logger.info({
              queues: _.pluck(queuesWithTooManyConsumers, 'name')
            }, 'we should grab executors from queues');
            return getConsumersForQueues(queuesWithTooManyConsumers)
              .then(function (consumers) {
                consumers = _.flatten(consumers);
                logger.info({
                  consumers: consumers
                }, 'consumers found');
                var selectedConsumer = _.first(consumers);
                /*jshint camelcase:false*/
                logger.info('telling consumer', selectedConsumer.peer_host + ":" + selectedConsumer.peer_port, 'to reaquire');
                return killExecutor(selectedConsumer.peer_host);
              });
          } else {
            var scaleUpParams = {
              PolicyName: 'increase-executors',
              /* required */
              AutoScalingGroupName: 'executors',
              HonorCooldown: true
            };
            logger.info({
              params: scaleUpParams
            }, 'increasing executors');
            return autoscaling.executePolicyAsync(scaleUpParams);
          }
        } else if (queuesWithTooManyConsumers.length > 0) {
          logger.info('we can remove executors');
          var scaleDownParams = {
            PolicyName: 'decrease-executors',
            /* required */
            AutoScalingGroupName: 'executors',
            HonorCooldown: true
          };
          logger.info({
            params: scaleDownParams
          }, 'decreasing executors');
          return autoscaling.executePolicyAsync(scaleDownParams);
        } else {
          logger.info('we seem to have the right number of executors');
        }

      });

  }).catch(function (err) {
    console.log(err);
  });

  //are there any queues that need executors (have no consumers)
  //are there queues that need to be rebalanced (have too many executors per message)
  //do we need to add more executors
  //send rebalance signal?

  //scale up?
  //scale down?
}

module.exports = rebalance;
