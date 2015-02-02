'use strict';
var AWS = require('aws-sdk');
var config = require('config');
var BBPromise = require('bluebird');
var _ = require('lodash');
var fs = require('fs');
var util = require('util');
var chef = require('chef');
var key = fs.readFileSync(config.get('Hoist.chef.key'));
var logger = require('hoist-logger');
var chefClient = BBPromise.promisifyAll(chef.createClient(config.get('Hoist.chef.user'), key, config.get('Hoist.chef.server')));
AWS.config.update({
  accessKeyId: config.get('Hoist.aws.account'),
  secretAccessKey: config.get('Hoist.aws.secret'),
  region: config.get('Hoist.aws.region')
});
var sqs = BBPromise.promisifyAll(new AWS.SQS());

function filterMessages(messages, event) {
  return _.filter(messages, function (message) {
    return message.Event === event;
  });
}

function deleteNodes(notifications) {
  return BBPromise.try(function () {
    return filterMessages(notifications, 'autoscaling:EC2_INSTANCE_TERMINATE');
  }).then(function (events) {
    return _.map(events, function (ev) {
      return 'executor-' + ev.EC2InstanceId;
    });
  }).then(function (nodes) {
    return BBPromise.all(
      _.map(nodes, function (node) {
        logger.info({
          node: node
        }, 'attempting to delete node');
        return chefClient.deleteAsync('/nodes/' + node).spread(function (res, body) {
          if (res.statusCode !== 200) {
            var error = new Error('error deleting node from chef');
            error.responseCode = res.statusCode;
            error.body = body;
            throw error;
          }
          logger.info({
            node: node,
            res: res.statusCode
          }, 'deleted node from chef');
        }).catch(function (err) {
          logger.warn({
            client: node,
            error: util.inspect(err)
          }, 'error deleteing client from chef');
        }).then(function () {
          return chefClient.deleteAsync('/clients/' + node).spread(function (res, body) {
            if (res.statusCode !== 200) {
              var error = new Error('error deleting node from chef');
              error.responseCode = res.statusCode;
              error.body = body;
              throw error;
            }
            logger.info({
              client: node,
              res: res.statusCode
            }, 'deleted client from chef');
          }).catch(function (err) {
            logger.warn({
              client: node,
              error: util.inspect(err)
            }, 'error deleteing client from chef');
          });
        });
      })
    );

  });
}



function processMessages(messages) {
  return BBPromise.try(function () {
      return _.map(messages, function (message) {
        var body = JSON.parse(message.Body);
        return JSON.parse(body.Message);
      });
    })
    .then(function (notifications) {
      return BBPromise.all([deleteNodes(notifications)]);
    });
}

module.exports = function () {
  return sqs.getQueueUrlAsync({
    QueueName: 'executor-scaling-events',
  }).then(function (data) {
    var queueUrl = data.QueueUrl;
    logger.info('polling scailing events queue');
    return sqs.receiveMessageAsync({
      QueueUrl: queueUrl,
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 1
    }).then(function (data) {

      if (!data.Messages || !data.Messages.length) {
        logger.info('recieved no messages from queue');
        return;
      }
      logger.info('processing messages');
      return processMessages(data.Messages).then(function () {
        return _.map(data.Messages, function (message, index) {
          return {
            Id: index + '',
            ReceiptHandle: message.ReceiptHandle
          };
        });
      }).then(function (batch) {
        logger.info('clearing messages from queue');
        return sqs.deleteMessageBatchAsync({
          Entries: batch,
          QueueUrl: queueUrl
        });

      }).then(function () {
        return module.exports();
      }).catch(function (err) {
        logger.alert(err);
        logger.error(err);
      });

    });
  });

};
