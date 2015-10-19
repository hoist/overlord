'use strict';

import logger from '@hoist/logger';
import Bluebird from 'bluebird';
import ExecutorMetrics from '../models/executor_metrics';
import config from 'config';
import AWS from 'aws-sdk';
import url from 'url';
import request from 'request-promise';
import Moment from 'moment';
import {
  find,
  filter,
  takeRight
}
from 'lodash';

AWS.config.update({
  accessKeyId: config.get('Hoist.aws.account'),
  secretAccessKey: config.get('Hoist.aws.secret'),
  region: config.get('Hoist.aws.region')
});

class ExecutorScaler {
  constructor() {
    this._logger = logger.child({
      cls: this.constructor.name
    });
    this._autoscaling = Bluebird.promisifyAll(new AWS.AutoScaling());
  }
  loadPreviousMetrics() {
    return ExecutorMetrics.findOneAsync({}).then((metrics) => {
      metrics = metrics || new ExecutorMetrics();
      return metrics;
    });
  }
  generateNewMetrics(timestamp, queues, metrics) {
    return Promise.resolve()
      .then(() => {
        return queues.map((queue) => {
          return {
            name: queue.name,
            consumers: queue.consumers,
            messagesReady: queue.messages_ready
          };
        });
      }).then((queueStats) => {
        metrics.measurements = takeRight(metrics.measurements || [], 4);
        metrics.measurements.push({
          queueCount: queues.length,
          executorCount: queueStats.reduce((n, queueStat) => {
            return n + queueStat.consumers;
          }, 0),
          timestamp: timestamp.utc().toDate(),
          queues: queueStats
        });
        return metrics;
      });
  }
  generateDifference(firstReading, secondReading, thirdReading, currentReading) {
    return Promise.resolve()
      .then(() => {
        return currentReading.queues.map((queue) => {
          let queueStats1 = find(firstReading.queues, (q) => {
            return q.name === queue.name;
          });
          let queueStats2 = find(secondReading.queues, (q) => {
            return q.name === queue.name;
          });
          let queueStats3 = find(thirdReading.queues, (q) => {
            return q.name === queue.name;
          });
          if (queueStats1 === null && queueStats2 === null && queueStats3 === null) {
            this._logger.info({
              queue: queue.name
            }, 'no previous reading for queue (adding two executors)');
            return {
              queue: queue.name,
              executorChange: 2
            };
          } else if (!(queueStats1) || !(queueStats2) || !(queueStats3)) {
            this._logger.info({
              queue: queue.name
            }, 'incomplete measurements for queue');
            return {
              queue: queue.name,
              executorChange: 0
            };
          } else {
            if (queue.messagesReady === queueStats1.messagesReady === queueStats2.messagesReady === queueStats3.messagesReady === 0) {
              this._logger.info({
                queue: queue.name
              }, 'no messages in readings for queue, returning to 2 executors');
              return {
                queue: queue.name,
                executorChange: (queue.consumers - 2) * -1
              };
            } else {
              let diff1 = queue.messagesReady - queueStats3.messagesReady;
              let diff2 = queueStats3.messagesReady - queueStats2.messagesReady;
              let diff3 = queueStats2.messagesReady - queueStats1.messagesReady;
              let averageDifference = Math.round(diff1 + diff2 + diff3 / 3);

              let executorChange = 0;

              if (queue.consumers < 2) {
                executorChange = 2 - queue.consumers;
              } else if (queue.messagesReady === 0 && queue.consumers > 2) {
                executorChange = 2 - queue.consumers;
              } else if (queue.consumers > 20) {
                executorChange = 20 - queue.consumers;
              } else if (averageDifference > 0 && queue.consumers < 20) {
                executorChange += 2;
              } else if (queue.messagesReady > 1000 && queue.consumers < 20) {
                executorChange += 2;
              } else if (queue.messagesReady < 1000 && averageDifference < Math.ceil((queue.messagesReady / 4) * -1) && queue.consumers > 2) {
                executorChange -= 2;
              }
              this._logger.info({
                queue: queue.name,
                averageDifference,
                diff1,
                diff2,
                diff3,
                executorChange
              }, 'generated averages');
              return {
                queue: queue.name,
                executorChange
              };
            }
          }

        });
      });

  }
  changeScale(metrics) {
    return Promise.resolve()
      .then(() => {
        if (metrics.measurements.length < 4) {
          this._logger.info('not enough measurements to make decisions');
          return null;
        }
        let currentReading = metrics.measurements[metrics.measurements.length - 1];
        let thirdReading = metrics.measurements[metrics.measurements.length - 2];
        let secondReading = metrics.measurements[metrics.measurements.length - 3];
        let firstReading = metrics.measurements[metrics.measurements.length - 4];
        return this.generateDifference(firstReading, secondReading, thirdReading, currentReading)
          .then((difference) => {
            return this._autoscaling.describeAutoScalingGroupsAsync({
              AutoScalingGroupNames: [
                'main-cluster_executor_container_host_autoscale'
              ]
            }).then((data) => {
              let currentDesiredCapacity = data.AutoScalingGroups[0].DesiredCapacity;
              let executorChange = difference.reduce((n, diff) => {
                return n + diff.executorChange;
              }, 0);

              let newTotalExecutors = currentReading.executorCount + executorChange;
              let newExecutorVMCount = Math.ceil(newTotalExecutors / 10) + 4;
              //don't reduce executors (we could be waiting for some to connect)
              if (executorChange >= 0) {
                newExecutorVMCount = Math.max(currentDesiredCapacity, newExecutorVMCount);
              }
              this._logger.info({
                executorChange,
                newTotalExecutors,
                newExecutorVMCount
              }, 'differences generated');
              let configUpdate = {
                MinSize: Math.ceil(currentReading.queues.length / 5) + 1,
                MaxSize: (currentReading.queues.length * 2) + 1,
                DesiredCapacity: newExecutorVMCount,
                AutoScalingGroupName: 'main-cluster_executor_container_host_autoscale'
              };
              this._logger.info(configUpdate, 'new scale config generated');
              return this._autoscaling.updateAutoScalingGroupAsync(configUpdate);
            });
          });
      });
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
  scale() {
    let timestamp = new Moment();
    return Promise.resolve()
      .then(() => {
        this._logger.info('getting event queues');
        return this.getEventQueues();
      }).then((queues) => {
        this._logger.info('loading previous metrics');
        return this.loadPreviousMetrics()
          .then((previousMetrics) => {
            this._logger.info('generating new metrics');
            return this.generateNewMetrics(timestamp, queues, previousMetrics).then((newMetrics) => {
              this._logger.info('calculating new scale');
              return this.changeScale(newMetrics)
                .then(() => {
                  this._logger.info('saving metric changes');
                  return newMetrics.saveAsync();
                });
            });
          });

      }).catch((err) => {
        this._logger.error(err);

      });
  }
}

var mongoConnection = require('../mongoose_connection');

mongoConnection.connect();

let scaler = new ExecutorScaler();
scaler.scale().then(() => {
  process.exit(0);
});
