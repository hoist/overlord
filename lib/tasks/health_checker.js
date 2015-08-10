'use strict';
import AWS from 'aws-sdk';
import config from 'config';
import BBPromise from 'bluebird';
import logger from '@hoist/logger';
import Moment from 'moment';
import url from 'url';
import request from 'request-promise';
import HealthCheck from '../models/health_check';
import {
  flatten,
  includes,
  find,
  filter
}
from 'lodash';
AWS.config.update({
  accessKeyId: config.get('Hoist.aws.account'),
  secretAccessKey: config.get('Hoist.aws.secret'),
  region: config.get('Hoist.aws.region')
});


class HealthChecker {
  constructor() {
    this._logger = logger.child({
      cls: this.constructor.name
    });
    this.ec2 = BBPromise.promisifyAll(new AWS.EC2());
  }
  loadRabbitConnections() {
    var rabbitUrl = url.parse(config.get('Hoist.rabbit.managementurl'));
    rabbitUrl.pathname = '/api/connections';
    return request.get(url.format(rabbitUrl), {
        json: true
      })
      .then((response) => {
        return response.map((connection) => {
          return connection.peer_host;
        });
      });
  }
  loadRabbitQueues() {
    var rabbitUrl = url.parse(config.get('Hoist.rabbit.managementurl'));
    rabbitUrl.pathname = '/api/connections';
    return request.get(url.format(rabbitUrl), {
        json: true
      })
      .then((response) => {
        return response.filter((queue) => {
          return queue.name.startsWith('executor:commands:');
        }).map((queue) => {
          return queue.name;
        });
      });
  }
  loadEC2Details() {
    this._logger.info('finding instances in EC2');
    return this.ec2.describeInstancesAsync({
      Filters: [{
        Name: 'instance-state-name',
        Values: ['running']
      }, {
        Name: 'tag:aws:autoscaling:groupName',
        Values: ['main-cluster_executor_container_host_autoscale']
      }]
    }).then((result) => {
      var instances = result.Reservations.map((reservation) => {
        return reservation.Instances;
      });
      instances = flatten(instances).map((instance) => {
        return {
          id: instance.InstanceId,
          launchTime: new Moment(instance.LaunchTime),
          privateIpAddress: instance.PrivateIpAddress
        };
      });
      this._logger.info({
        instanceCount: instances.length
      }, 'got response');
      return instances;
    });
  }
  markHealth(instance, connections, queues) {
    if (instance.launchTime.isAfter(new Moment().subtract(15, 'minutes'))) {
      this._logger.info({
        instance: instance.id
      }, 'instance is less than 15 minutes old');
      instance.healthy = true;
    } else if (includes(connections, instance.privateIpAddress) && filter(queues, (queue) => {
        return new RegExp(`executor-[a|b]-${instance.id}`).test(queue);
      }).lenghth === 2) {
      this._logger.info({
        instance: instance.id
      }, 'instance connected');
      instance.healthy = true;
    } else {
      this._logger.info({
        instance: instance.id
      }, 'instance not connected');
      instance.healthy = false;
    }
  }
  updateHealthCheck(healthCheck, instances) {
    return Promise.resolve()
      .then(() => {
        let previousResults = healthCheck.instances;
        healthCheck.instances = [];
        this._logger.info('updating health check results');
        instances.forEach((instance) => {
          let instanceHealth = find(previousResults, (previousResult) => {
            return previousResult.instanceId === instance.id;
          }) || {
            instanceId: instance.id,
            passedChecks: 0,
            failedSince: null,
            currentState: 'healthy',
            failedChecks: 0

          };
          if (instance.healthy) {
            instanceHealth.failedSince = null;
            instanceHealth.passedChecks = instanceHealth.passedChecks + 1;
            instanceHealth.currentState = 'healthy';
          } else {
            instanceHealth.failedSince = instanceHealth.failedSince || new Moment().utc().toDate();
            instanceHealth.failedChecks = instanceHealth.failedChecks + 1;
            instanceHealth.currentState = 'unhealthy';
          }
          healthCheck.instances.push(instanceHealth);
        });
      });
  }
  terminateFailingInstances(healthCheck) {
    this._logger.info('finding failed instances');
    return Promise.resolve()
      .then(() => {
        let failedInstances = healthCheck.instances.filter((instance) => {
          return instance.currentState === 'unhealthy' &&
            new Moment(instance.failedSince).isBefore(new Moment().subtract(10, 'minutes'));
        });
        this._logger.info({
          failedInstances: failedInstances.length
        }, 'got failed instances');
        if (failedInstances.length > 0) {
          let instanceIds = failedInstances.map((instance) => {
            return instance.instanceId;
          });
          this._logger.info({
            instanceIds
          }, 'terminating instances');
          return this.ec2.terminateInstancesAsync({
            InstanceIds: instanceIds
          });
        }
      });
  }
  check() {
    return this.loadEC2Details()
      .then((instances) => {
        return Promise.all([
            this.loadRabbitConnections(),
            this.loadRabbitQueues()
          ])
          .then((results) => {
            let connections = results[0];
            let queues = results[1];
            this._logger.info({
              connections: connections.length
            }, 'connections');
            instances.forEach((instance) => {
              this.markHealth(instance, connections, queues);
            });
            this._logger.info('finding health check record');
            return HealthCheck.findOneAsync({}).then((healthCheck) => {
              this._logger.info('record found');
              return healthCheck || new HealthCheck();
            }).then((healthCheck) => {
              this._logger.info('updating health checks');
              return this.updateHealthCheck(healthCheck, instances).then(() => {
                this._logger.info('terminating instances');
                return this.terminateFailingInstances(healthCheck).then(() => {
                  console.log(healthCheck.saveAsync);
                  this._logger.info({

                  }, 'saving health check');
                  return healthCheck.saveAsync().then(() => {
                    this._logger.info('saved health checks');
                  }).catch((err) => {
                    this._logger.error(err);
                  });
                });
              });
            });
          });

      }).catch((err) => {
        this._logger.error(err);
        throw err;
      });

  }
}

var mongoConnection = require('../mongoose_connection');

mongoConnection.connect();

let healthChecker = new HealthChecker();
healthChecker.check().then(() => {
  process.exit(0);
});
