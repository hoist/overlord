'use strict';
require('babel/register');

var logger = require('@hoist/logger');
var Agenda = require('agenda');
var config = require('config');
var agenda = new Agenda();
var chefJob = require('./lib/tasks/chef_task');
var countQueuesJob = require('./lib/tasks/count_queues_task');
var checkEC2Job = require('./lib/tasks/ec2_check_status_task');
var rebalanceJob = require('./lib/tasks/rebalance_executors_task');
var Rebalancer = require('./lib/tasks/rebalancer');
var pruneNewRelicJob = require('./lib/tasks/prune_new_relic_task');
var cullQueuesTask = require('./lib/tasks/cull_queues_task');
var rebootExecutorsTask = require('./lib/tasks/reboot_executors_task');
var bluebird = require('bluebird');

agenda.database(config.get('Hoist.mongo.overlord'), 'operational-jobs');


var rebalancer = new Rebalancer();

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
    rebalancer.executeRebalance(),
    rebalanceJob()
  ]).nodeify(done);

});

agenda.define('scale executors', {
  lockLifetime: 10000
}, function (job, done) {
  logger.info('starting scale job');
  bluebird.allSettled([
    rebalancer.executeScale(),
    rebalanceJob()
  ]).nodeify(done);

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
agenda.define('reboot executor instances', {
  lockLifetime: 10000
}, function (job, done) {
  logger.info('starting executor reboot job');
  rebootExecutorsTask().nodeify(done);
});
logger.info('registering schedule');

agenda.every('2 minutes', 'maintain chef nodes');
agenda.every('1 minute', 'count queues');
agenda.every('5 minutes', 'check ec2 instances');
agenda.every('10 seconds', 'rebalance executors');
agenda.every('5 minutes', 'scale executors');
agenda.every('5 minutes', 'prune new relic servers');
agenda.every('30 minutes', 'prune rabbitmq queues');
agenda.every('6 hours', 'reboot executor instances');

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
