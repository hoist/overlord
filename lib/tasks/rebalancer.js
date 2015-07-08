'use strict';
import config from 'config';
import url from 'url';
import request from 'request-promise';
import {
  filter,
  take,
  pluck,
  flatten
}
from 'lodash';
import AWS from 'aws-sdk';
import Bluebird from 'bluebird';
import amqp from 'amqplib';
import logger from '@hoist/logger';
AWS.config.update({
  accessKeyId: config.get('Hoist.aws.account'),
  secretAccessKey: config.get('Hoist.aws.secret'),
  region: config.get('Hoist.aws.region')
});

class Rebalancer {
  constructor() {
    this._logger = logger.child({
      cls: this.constructor.name
    });
    this._autoscaling = Bluebird.promisifyAll(new AWS.AutoScaling());
  }
  getChannel() {
    if (this._channel) {
      clearTimeout(this._channelTimeout);
      this._channelTimeout = setTimeout(() => {
        this._connection.close();
        this._channel.close();
        delete this._channel;
        delete this._connection;
      }, 1500);
      return Promise.resolve(this._channel);
    } else {
      return amqp.connect(config.get('Hoist.rabbit.url'), {
        heartbeat: 60
      }).then((connection) => {
        this._connection = connection;
        return connection.createChannel()
          .then((channel) => {

            this._channel = channel;
            this._channelTimeout = setTimeout(() => {
              connection.close();
              channel.close();
              delete this._channel;
              delete this._connection;
            }, 1500);
            return channel;
          });
      });
    }
  }
  getEventQueues() {
    var rabbitUrl = url.parse(config.get('Hoist.rabbit.managementurl'));
    rabbitUrl.pathname = '/api/queues';
    return request.get(url.format(rabbitUrl), {
        json: true
      })
      .then((response) => {
        return filter(response, function (queue) {
          return queue.name.endsWith('_events');
        });
      });
  }
  getExecutorCount(queue) {
    this._logger.info({
      messagesReady: queue.messages_ready
    }, 'determining executor count for queue');
    //minimum of two executors
    //maxium of 20 executors
    //one executor per 500 messages in queue otherwise
    return Math.max(2, Math.min(20, Math.floor(queue.messages_ready / 500)));
  };
  determineAutoScaleConfig(queues) {
    return Promise.resolve()
      .then(() => {
        this._logger.info('determining desired executor count');
        return queues.map((queue) => {
          return this.getExecutorCount(queue);
        }).reduce((a, b) => {
          return a + b;
        });
      }).then((desiredExecutorCount) => {
        this._logger.info({
          desiredExecutorCount
        }, 'determining scale');
        let desiredCapacity = Math.ceil(desiredExecutorCount / 2);
        let minSize = queues.length + 1;
        let maxSize = (queues.length * 10) + 1;
        desiredCapacity = Math.min(maxSize, desiredCapacity);
        desiredCapacity = Math.max(minSize, desiredCapacity);
        this._logger.info({
          minSize, maxSize, desiredCapacity
        }, 'sending new config');
        return {
          MinSize: minSize,
          MaxSize: maxSize,
          DesiredCapacity: desiredCapacity,
          AutoScalingGroupName: 'main-cluster_executor_container_host_autoscale'
        };
      }).then((newConfig) => {
        return this._autoscaling.updateAutoScalingGroupAsync(newConfig);
      });
  }
  sendRebalanceCommands(queues) {
    this._logger.info('sending rebalance commands');
    return Promise.resolve()
      .then(() => {
        return Promise.all(queues.map((queue) => {
          return this.getConsumerStats(queue);
        }));
      })
      .then((queueStats) => {
        //we can take from these queues freely
        let overPopulatedConsumers = flatten(filter(queueStats, (queueStat) => {
          return queueStat.consumers > queueStat.expectedConsumers;
        }).map((queue) => {
          return take(queue.consumerTags, queue.consumers - queue.expectedConsumers).map((tag) => {
            return {
              consumerTag: tag,
              applicationId: queue.name.replace('_events', '')
            };
          });
        }));

        //we can take from these queues in an emergency
        let stealableQueues = flatten(filter(queueStats, (queueStat) => {
          return queueStat.consumers <= queueStat.expectedConsumers && queueStat.consumers > 1;
        }).map((queue) => {
          return take(queue.consumerTags, 1).map((tag) => {
            return {
              consumerTag: tag,
              applicationId: queue.name.replace('_events', '')
            };
          });
        }));

        let underPopulatedConsumerCount = filter(queueStats, (queueStat) => {
          return queueStat.consumers < queueStat.expectedConsumers && queueStat.consumers > 0;
        }).reduce((current, queue) => current + (queue.expectedConsumers - queue.consumers), 0);
        //we need to populate this many empty queues
        let emptyQueueCount = filter(queueStats, (queueStat) => {
          return queueStat.consumers === 0;
        }).length;
        let rebalancingCommands = [];
        if (overPopulatedConsumers.length < emptyQueueCount) {
          rebalancingCommands = overPopulatedConsumers.concat(take(stealableQueues, emptyQueueCount - overPopulatedConsumers.length));
        } else {
          rebalancingCommands = take(overPopulatedConsumers, emptyQueueCount + underPopulatedConsumerCount);
        }
        logger.info({
          rebalanceCommands: rebalancingCommands.length,
          stealableQueues: stealableQueues.length,
          emptyQueueCount,
          underPopulatedConsumerCount,
          overPopulatedConsumers
        }, 'gathered queue stats');
        if (rebalancingCommands.length > 0) {
          return this.getChannel().then((channel) => {
            rebalancingCommands.forEach((rebalanceCommand) => {
              this._logger.info({
                consumerTag: rebalanceCommand.consumerTag,
                applicationId: rebalanceCommand.applicationId
              }, 'issuing rebalance command');
              channel.publish('commands', 'command.test-application.rebalance', new Buffer(JSON.stringify({
                issuer: 'overlord'
              })), {
                priority: 9,
                type: 'rebalance',
                headers: {
                  'x-target-consumer-tag': rebalanceCommand.consumerTag,
                  'x-application-id': rebalanceCommand.applicationId
                }
              });
            });
          });
        }
      });
  }
  getConsumerStats(queue) {
    let rabbitUrl = url.parse(config.get('Hoist.rabbit.managementurl'));
    rabbitUrl.pathname = `/api/queues/${encodeURIComponent(queue.vhost)}/${encodeURIComponent(queue.name)}`;
    return request.get(url.format(rabbitUrl), {
        json: true
      })
      .then((response) => {
        let stats = {
          consumers: 0,
          expectedConsumers: 0,
          name: queue.name,
          consumerTags: pluck(response.consumer_details, 'consumer_tag')
        };
        stats.expectedConsumers = Math.max(2, Math.min(20, Math.floor(response.messages_ready / 500)));
        stats.consumers = response.consumers;
        return stats;
      });
  }
  execute() {
    return Promise.resolve()
      .then(() => {
        this._logger.info('getting event queues');
        return this.getEventQueues();
      }).then((queues) => {
        this._logger.info('determining auto scale settings');
        return this.determineAutoScaleConfig(queues)
          .then(() => {
            this._logger.info('rebalancing executors');
            return this.sendRebalanceCommands(queues);
          });
      }).catch((err) => {
        this._logger.error(err);
      });
  }
}

export default Rebalancer;
