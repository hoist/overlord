'use strict';
var logger = require('@hoist/logger');
var Agenda = require('agenda');
var config = require('config');
var agenda = new Agenda();
var chefJob = require('./lib/tasks/chef_task');
var countQueuesJob = require('./lib/tasks/count_queues_task');
var checkEC2Job = require('./lib/tasks/ec2_check_status_task');
var rebalanceJob = require('./lib/tasks/rebalance_executors_task');
var pruneNewRelicJob = require('./lib/tasks/prune_new_relic_task');
var cullQueuesTask = require('./lib/tasks/cull_queues_task');
agenda.database(config.get('Hoist.mongo.overlord'), 'operational-jobs');

logger.info('starting server');
logger.info('registering chef maintainance job');
agenda.define('maintain chef nodes', function (job, done) {
  logger.info('starting chef job');
  chefJob().nodeify(done);
});
agenda.define('rebalance executors', {
  lockLifetime: 10000
}, function (job, done) {
  logger.info('starting rebalance job');
  rebalanceJob().nodeify(done);
});
agenda.define('count queues', {
  lockLifetime: 10000
}, function (job, done) {
  logger.info('starting count queues job');
  countQueuesJob().nodeify(done);
});
agenda.define('check ec2 instances', {
  lockLifetime: 10000
}, function (job, done) {
  logger.info('starting ec2 check job');
  checkEC2Job().nodeify(done);
});

agenda.define('prune new relic servers', {
  lockLifetime: 10000
}, function (job, done) {
  logger.info('starting new relic prune job');
  pruneNewRelicJob().nodeify(done);
});
agenda.define('prune rabbitmq queues', {
  lockLifetime: 10000
}, function (job, done) {
  logger.info('starting rabbitmq prune job');
  cullQueuesTask().nodeify(done);
});

logger.info('registering schedule');

agenda.every('2 minutes', 'maintain chef nodes');
agenda.every('1 minute', 'count queues');
agenda.every('5 minutes', 'check ec2 instances');
agenda.every('10 seconds', 'rebalance executors');
agenda.every('5 minutes', 'prune new relic servers');
agenda.every('30 minutes', 'prune rabbitmq queues');

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
