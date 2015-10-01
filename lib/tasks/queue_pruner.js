'use strict';
import config from 'config';
import {
  endsWith,
  clone
}
from 'lodash';
import logger from '@hoist/logger';
import moment from 'moment';
import url from 'url';
import request from 'request-promise';

class QueuePruner {
  constructor() {
    this._logger = logger.child({
      cls: 'QueuePruner'
    });
    this.rabbitUrl = url.parse(config.get('Hoist.rabbit.managementurl'));
  }
  getQueuesData() {
    this._logger.info('getting queues');
    this.rabbitUrl.pathname = '/api/queues';
    return request.get(url.format(this.rabbitUrl), {
      json: true
    });
  }
  pruneInactiveQueues() {
    this._logger.info('starting prune task');
    return this.getQueuesData()
      .then((response) => {
        this._logger.info({
          queues: response.length
        }, 'queues from server');
        return response.filter((queue) => {
          return endsWith(queue.name, '_events');
        });
      }).then((queues) => {
        logger.info({
          queues: queues.length
        }, 'queues to look at');
        var mappedQueues = queues.map((queue) => {
          return {
            idleSince: moment.utc(queue.idle_since, "YYYY-MM-DD HH:mm:ss"),
            messages: queue.messages_ready,
            name: queue.name,
            vhost: queue.vhost
          };
        });
        mappedQueues = mappedQueues.filter((queue) => {
          return queue.idleSince.isBefore(moment.utc().add(-6, 'hours')) && queue.messages === 0;
        });
        this._logger.info({
          idleQueues: mappedQueues.length
        });
        return Promise.all(mappedQueues.map((queue) => {
          var uri = clone(this.rabbitUrl);
          uri.pathname = '/api/queues/' + encodeURIComponent(queue.vhost) + '/' + queue.name;

          var options = {
            method: 'DELETE',
            uri: url.format(uri),
            json: true
          };
          logger.info({
            options: options
          });
          return request(options);
        }));
      }).catch((err) => {
        this._logger.error(err);
      });
  }
}

let pruner = new QueuePruner();
pruner.pruneInactiveQueues();
