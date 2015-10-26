'use strict';
import config from 'config';
import url from 'url';
import request from 'request-promise';
import {
  filter,
  take,
  pluck,
  flatten,
  sortBy
}
from 'lodash';

import Bluebird from 'bluebird';
import amqp from 'amqplib';
import logger from '@hoist/logger';


class Rebalancer {
  constructor() {
    this._logger = logger.child({
      cls: this.constructor.name
    });

  }
  getChannel() {
    if (this._channel && this._channel !== 'resolving') {
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
      'lengths_age': 120,
      'lengths_incr': 1
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
      expectedCount = 2;
    } else if (queue.messages_ready > 1000) {
      expectedCount++;
    } else {
      let messageStats = queue.messages_ready_details;

      if (messageStats) {
        if (messageStats.avg_rate > 10) {
          expectedCount += 8;
        } else if (messageStats.avg_rate > 5) {
          expectedCount += 4;
        } else if (messageStats.avg_rate > -5) {
          expectedCount += 2;
        } else if (messageStats.avg_rate < -30) {
          expectedCount -= 8;
        } else if (messageStats.avg_rate < -20) {
          expectedCount -= 4;
        } else if (messageStats.avg_rate < -5) {
          expectedCount -= 2;
        }
      } else {
        expectedCount = 2;
      }
    }
    expectedCount = Math.max(2, Math.min(20, expectedCount));
    this._logger.info({
      expectedCount, queue: queue.name
    }, 'expected consumer count');
    return expectedCount;
  };
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
          return take(sortBy(queue.consumerTags, () => {
            return Math.random();
          }), queue.consumers - queue.expectedConsumers).map((tag) => {
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
            return Promise.all([
              rebalancingCommands.map((rebalanceCommand) => {
                this._logger.info({
                  consumerTag: rebalanceCommand.consumerTag,
                  applicationId: rebalanceCommand.applicationId
                }, 'issuing rebalance command');
                if (!channel.publish) {
                  this._logger.error('no publish method');
                  this._logger.info({
                    channel
                  }, 'channel?');
                  return null;
                }
                let drained = new Promise((resolve) => {
                  channel.on('drain', resolve);
                });

                let published = channel.publish('commands', `command.${rebalanceCommand.applicationId}.rebalance`, new Buffer(JSON.stringify({
                  issuer: 'overlord'
                })), {
                  priority: 9,
                  type: 'rebalance',
                  headers: {
                    'x-target-consumer-tag': rebalanceCommand.consumerTag,
                    'x-application-id': rebalanceCommand.applicationId
                  }
                });
                //console.log(published);
                return published || drained;
              })
            ]).then(() => {
              let connection = channel.connection;
              return channel.close().then(() => {
                return connection.close();
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
  rebalance() {
    return Promise.resolve()
      .then(() => {
        this._logger.info('getting event queues');
        return this.getEventQueues();
      }).then((queues) => {
        this._logger.info('rebalancing executors');
        return this.sendRebalanceCommands(queues).then(() => {
          console.log('finished rebalancer');
        });
      }).catch((err) => {
        if (err.code && err.code === 'ScalingActivityInProgress') {
          this._logger.warn(err);
        } else {
          this._logger.error(err);
          this._logger.alert(err);
        }
      });
  }
}
var mongoConnection = require('../mongoose_connection');

mongoConnection.connect();

let rebalancer = new Rebalancer();
rebalancer.rebalance().then(() => {
  process.exit(0);
});
