'use strict';
var mongoose = require('mongoose');
var config = require('config');

mongoose.connect(config.get('Hoist.mongo.overlord'));
