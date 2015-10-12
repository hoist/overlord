'use strict';
require('babel/register');
var connectionManager = require('./lib/models/connection_manager');
var config = require('config');

connectionManager.connect(config.get('Hoist.mongo.overlord'));
