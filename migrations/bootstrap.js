'use strict';
var connectionManager = require('../models/connection_manager');
var config = require('config');

connectionManager.connect(config.get('Hoist.mongo.overlord'));
