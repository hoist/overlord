'use strict';
var logger = require('hoist-logger');
var Agenda = require('agenda');
var config = require('config');
var agenda = new Agenda();
var chefJob = require('./lib/chef_task');
var countQueuesJob = require('./lib/count_queues_task');
var checkEC2Job = require('./lib/ec2_check_status');
var rebalanceJob = require('./lib/rebalance_executors_task');
agenda.database(config.get('Hoist.overlord.mongo.db'), 'operational-jobs');
logger.info('starting server');
logger.info('registering chef maintainance job');
agenda.define('maintain chef nodes', function (job, done) {
  logger.info('starting chef job');
  chefJob().nodeify(done);
});
agenda.define('rebalance executors', function (job, done) {
  logger.info('starting rebalance job');
  rebalanceJob().nodeify(done);
});
agenda.define('count queues', function (job, done) {
  logger.info('starting count queues job');
  countQueuesJob().nodeify(done);
});
agenda.define('check ec2 instances', function (job, done) {
  logger.info('starting ec2 check job');
  checkEC2Job().nodeify(done);
});

logger.info('registering schedule');
agenda.every('2 minutes', 'maintain chef nodes');
agenda.every('1 minute', 'count queues');
agenda.every('5 minutes', 'check ec2 instances');
agenda.every('5 minutes', 'rebalance executors');

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
