'use strict';
require('babel/register');

var logger = require('@hoist/logger');
var Agenda = require('agenda');
var config = require('config');
var agenda = new Agenda();
var pruneNewRelicJob = require('./lib/tasks/prune_new_relic_task');
var cullQueuesTask = require('./lib/tasks/cull_queues_task');

var mongoConnection = require('./lib/mongoose_connection');

mongoConnection.connect();

agenda.database(config.get('Hoist.mongo.overlord'), 'operational-jobs');


logger.info('starting server');
logger.info('registering chef maintainance job');

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
