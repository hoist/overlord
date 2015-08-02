'use strict';
require('babel/register');

var logger = require('@hoist/logger');
var Agenda = require('agenda');
var config = require('config');
var agenda = new Agenda();
var chefJob = require('./lib/tasks/chef_task');
var countQueuesJob = require('./lib/tasks/count_queues_task');
var pruneNewRelicJob = require('./lib/tasks/prune_new_relic_task');
var cullQueuesTask = require('./lib/tasks/cull_queues_task');
var bluebird = require('bluebird');

var Rebalancer = require('./lib/tasks/rebalancer');
var ExecutorScaler = require('./lib/tasks/executor_scaler');
var mongoConnection = require('./lib/mongoose_connection');

mongoConnection.connect();

agenda.database(config.get('Hoist.mongo.overlord'), 'operational-jobs');


var rebalancer = new Rebalancer();
var scaler = new ExecutorScaler();

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
  bluebird.allSettled([
    rebalancer.rebalance()
  ]).nodeify(done);

});

agenda.define('scale executors', {
  lockLifetime: 10000
}, function (job, done) {
  logger.info('starting scale job');
  bluebird.allSettled([
    scaler.scale()
  ]).nodeify(done);

});

agenda.define('count queues', {
  lockLifetime: 10000
}, function (job, done) {
  logger.info('starting count queues job');
  countQueuesJob().nodeify(done);
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
agenda.every('10 seconds', 'rebalance executors');
agenda.every('5 minutes', 'scale executors');
agenda.every('5 minutes', 'prune new relic servers');
agenda.every('30 minutes', 'prune rabbitmq queues');

logger.info('starting agenda');
agenda.start();

function graceful() {
  logger.info('stopping agenda');
  agenda.stop(function () {
    mongoConnection.disconnect();
    process.exit(0);
  });
}
process.on('SIGTERM', graceful);
process.on('SIGINT', graceful);
