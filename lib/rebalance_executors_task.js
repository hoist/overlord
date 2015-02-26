'use strict';
var url = require('url');
var config = require('config');
var request = require('request-promise');
var AWS = require('aws-sdk');
var logger = require('hoist-logger');
var _ = require('lodash');
var BBPromise = require('bluebird');
var amqp = require('amqplib');

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
            return {
              channel: _.pluck(response.consumer_details, 'channel_details'),
              queue: queue
            };
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

function rebalanceExecutor(privateIp, queue) {
  return amqp.connect(config.get('Hoist.rabbit.url'), {
    heartbeat: 60
  }).then(function (connection) {
    return connection.createChannel()
      .then(function (channel) {
        return channel.assertExchange('executor_commands', 'topic')
          .then(function (response) {
            logger.info('publishing command');
            return channel.publish(response.exchange, 'command:' + privateIp + ':' + queue, new Buffer(JSON.stringify({
              task: 'reaquire'
            })));
          });
      }).then(function(){
        return BBPromise.delay(2000);
      }).then(function () {
        return connection.close();

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
          return queue.consumers > 20 || (queue.consumers > 2 && ((queue.consumers / queue.messages_ready) > 0.001));
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
                var selectedChannel = selectedConsumer.channel[0];
                logger.info('telling consumer', selectedChannel.peer_host + ":" + selectedConsumer.queue.name, 'to reaquire');
                return rebalanceExecutor(selectedChannel.peer_host,selectedConsumer.queue.name);
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
