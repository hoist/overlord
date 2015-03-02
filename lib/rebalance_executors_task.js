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

//var ec2 = BBPromise.promisifyAll(new AWS.EC2());
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

function killConnection(connectionName) {
  var rabbitUrl = url.parse(config.get('Hoist.rabbit.managementurl'));
  rabbitUrl.pathname = '/api/connections/' + encodeURIComponent(connectionName);
  logger.info('killing connection', url.format(rabbitUrl));
  var options = {
    method: 'DELETE',
    uri: url.format(rabbitUrl),
    json: true
  };
  return request(options);
}

function rebalanceQueue(queue) {
  console.log('removeing executor from queue', queue.name);
  var rabbitUrl = url.parse(config.get('Hoist.rabbit.managementurl'));
  rabbitUrl.pathname = '/api/queues/' + encodeURIComponent(queue.vhost) + '/' + encodeURIComponent(queue.name);
  return request.get(url.format(rabbitUrl), {
      json: true
    })
    .then(function (response) {
      /* pick the first consumer */
      /* jshint camelcase: false */
      if (response.consumer_details && response.consumer_details.length) {
        return response.consumer_details[0];
      }

    }).then(function (consumer) {
      /* jshint camelcase: false */
      return killConnection(consumer.channel_details.connection_name);
    });
}

function rebalanceQueues(queues) {
  return BBPromise.all(_.map(queues, rebalanceQueue)).then(function () {
    return BBPromise.delay(10000);
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
          return queue.consumers < 2;
        });
        logger.info({
          queues: _.pluck(queuesThatHaveNoConsumers, 'name')
        }, 'do we have any queues that need consumers?');
        var queuesWithTooFewConsumers = _.filter(queues, function (queue) {
          /* jshint camelcase:false */
          return queue.consumers < 20 && ((queue.consumers / queue.messages_ready) < 0.001);
        });
        logger.info({
          queues: _.pluck(queuesWithTooFewConsumers, 'name')
        }, 'do we have any queues that have too few consumers?');
        var queuesWithTooManyConsumers = _.filter(queues, function (queue) {
          /* jshint camelcase:false */
          return queue.consumers > 20 || (queue.consumers > 2 && ((queue.consumers / queue.messages_ready) > 0.002));
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
            return rebalanceQueues(queuesWithTooManyConsumers).then(function () {
              return false;
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
            return autoscaling.executePolicyAsync(scaleUpParams).then(function () {
              return true;
            });
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
          return autoscaling.executePolicyAsync(scaleDownParams).then(function () {
            return true;
          });
        } else {
          logger.info('we seem to have the right number of executors');
          return true;
        }

      }).then(function (done) {
        if (!done) {
          return BBPromise.delay(10000).then(function () {
            return module.exports();
          });

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
