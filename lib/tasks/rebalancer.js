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
      return Promise.resolve(this._channel);
    } else if (this._channel === 'resolving') {
      return Bluebird.delay(20)
        .then(() => {
          return this.getChannel();
        });

    } else {
      this._channel = 'resolving';
      return amqp.connect(config.get('Hoist.rabbit.url'), {
        heartbeat: 60
      }).then((connection) => {
        this._connection = connection;
        return connection.createChannel()
          .then((channel) => {
            this._channel = channel;
            return channel;
          });
      });
    }
  }
  getEventQueues() {
    var rabbitUrl = url.parse(config.get('Hoist.rabbit.managementurl'));
    rabbitUrl.pathname = '/api/queues';
    rabbitUrl.query = {
      'lengths_age': 600,
      'lengths_incr': 30
    };
    return request.get(url.format(rabbitUrl), {
        json: true
      })
      .then((response) => {
        return filter(response, function (queue) {
          return queue.name.endsWith('_events');
        });
      });
  }
  getDesiredExecutorCount(queue) {
    this._logger.info({
      messagesReady: queue.messages_ready
    }, 'determining executor count for queue');
    //minimum of two executors
    //maxium of 20 executors
    //one executor per 200 messages in queue otherwise
    let expectedCount = queue.consumers;
    if (queue.messages_ready === 0) {
      expectedCount = queue.consumers - 1;
    } else {
      let messageStats = queue.messages_ready_details;

      if (messageStats) {
        if (messageStats.avg_rate > 2) {
          expectedCount++;
        }
        if (messageStats.avg_rate <= 0) {
          expectedCount--;
        }
      } else {
        expectedCount = 2;
      }
    }
    return Math.max(2, Math.min(20, expectedCount));
  };
  determineAutoScaleConfig(queues) {
    return Promise.resolve()
      .then(() => {
        this._logger.info('determining desired executor count');
        return queues.map((queue) => {
          return this.getDesiredExecutorCount(queue);
        }).reduce((a, b) => {
          return a + b;
        });
      }).then((desiredExecutorCount) => {
        //always have a spare 2 executors
        desiredExecutorCount = desiredExecutorCount + 2;
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
        }, 'calcuated');
        return {
          MinSize: minSize,
          MaxSize: maxSize,
          DesiredCapacity: desiredCapacity
        };
      }).then((newConfig) => {
        let configUpdate = {
          AutoScalingGroupName: 'main-cluster_executor_container_host_autoscale'
        };
        let makeUpdate;
        let scaleTask;
        return this._autoscaling.describeAutoScalingGroupsAsync({
          AutoScalingGroupNames: ['main-cluster_executor_container_host_autoscale']
        }).then((result) => {
          let currentConfig = result.AutoScalingGroups[0];
          if (currentConfig.MinSize !== newConfig.MinSize) {
            this._logger.info('setting min size directly');
            configUpdate.MinSize = newConfig.MinSize;
            makeUpdate = true;
          }
          if (currentConfig.MaxSize !== newConfig.MaxSize) {
            this._logger.info('setting max size directly');

            configUpdate.MaxSize = newConfig.MaxSize;
            makeUpdate = true;
          }
          if (Math.abs(currentConfig.DesiredCapacity - newConfig.DesiredCapacity) > 3) {
            this._logger.info('setting desired capacity directly');
            configUpdate.DesiredCapacity = newConfig.DesiredCapacity;
            makeUpdate = true;
          } else if (currentConfig.DesiredCapacity < newConfig.DesiredCapacity) {
            scaleTask = {
              PolicyName: 'scale-up',
              AutoScalingGroupName: 'main-cluster_executor_container_host_autoscale',
              HonorCooldown: true
            };
          } else if (currentConfig.DesiredCapacity > newConfig.DesiredCapacity) {
            scaleTask = {
              PolicyName: 'scale-down',
              AutoScalingGroupName: 'main-cluster_executor_container_host_autoscale',
              HonorCooldown: true
            };
          }
          let promises = [];
          this._logger.info(makeUpdate, "update?");
          if (makeUpdate) {
            this._logger.info(configUpdate, 'updating config');
            promises.push(this._autoscaling.updateAutoScalingGroupAsync(configUpdate));
          } else {
            this._logger.info('scaling config correct');
          }
          if (scaleTask) {
            this._logger.info(scaleTask, 'scaling');
            promises.push(this._autoscaling.executePolicyAsync(scaleTask));
          } else {
            this._logger.info('no scale policy to execute');
          }
          return Promise.all(promises);
        });
        //return ;
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
              channel.publish('commands', `command.${rebalanceCommand.applicationId}.rebalance`, new Buffer(JSON.stringify({
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
        stats.expectedConsumers = this.getDesiredExecutorCount(queue);
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
        if (err.code && err.code === 'ScalingActivityInProgress') {
          this._logger.warn(err);
        } else {
          this._logger.error(err);
        }
      });
  }
}

export default Rebalancer;
