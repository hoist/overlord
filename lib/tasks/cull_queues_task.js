'use strict';
var config = require('config');
var _ = require('lodash');
var logger = require('@hoist/logger');
var moment = require('moment');
var url = require('url');
var request = require('request-promise');
var BBPromise = require('bluebird');
/*jshint camelcase:false*/

function cullQueues() {
  var rabbitUrl = url.parse(config.get('Hoist.rabbit.managementurl'));
  rabbitUrl.pathname = '/api/queues';
  return request.get(url.format(rabbitUrl), {
      json: true
    })
    .then(function (response) {
      return _.filter(response, function (queue) {
        return _.startsWith(queue.name, 'run_module_') || _.endsWith(queue.name, '_events');
      });
    }).then(function (queues) {
      return queues;
    })
    .then(function (queues) {

      var mappedQueues = _.map(queues, function (queue) {
        return {
          idleSince: moment.utc(queue.idle_since),
          messages: queue.messages_ready,
          name: queue.name,
          vhost: queue.vhost
        };
      });
      mappedQueues = _.filter(mappedQueues, function (queue) {
        return queue.idleSince.isBefore(moment.utc().add(-2, 'hours')) && queue.messages === 0;
      });
      logger.info({
        queues: mappedQueues
      });
      return BBPromise.all(_.map(mappedQueues, function (queue) {
        var uri = _.clone(rabbitUrl);
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
    }).catch(function (err) {
      logger.error(err);
    });
}

module.exports = cullQueues;
