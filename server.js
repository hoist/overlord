'use strict';
var logger = require('hoist-logger');
var Agenda = require('agenda');
var config = require('config');
var agenda = new Agenda();
var chefJob = require('./lib/chef_task');
var countQueuesJob = require('./lib/count_queues_task');
agenda.database(config.get('Hoist.overlord.mongo.db'), 'operational-jobs');
logger.info('starting server');
logger.info('registering chef maintainance job');
agenda.define('maintain chef nodes', function (job, done) {
  logger.info('starting chef job');
  chefJob().nodeify(done);
});
agenda.define('count queues', function (job, done) {
  logger.info('starting count queues job');
  countQueuesJob().nodeify(done);
});

logger.info('registering schedule');
agenda.every('2 minutes', 'maintain chef nodes');
agenda.every('1 minute', 'count queues');

logger.info('starting agenda');
agenda.start();

function graceful() {
  logger.info('stopping agenda');
  agenda.stop(function () {
    process.exit(0);
  });
}
process.on('SIGTERM', graceful);
process.on('SIGINT', graceful);
