'use strict';
var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
var BBPromise = require('bluebird');
var Schema = mongoose.Schema;
var EnvironmentSchema = new Schema({
  name: {
    type: String,
    required: 'name is required',
    index: {
      unique: 'name must be unique'
    }
  },
  tag: {
    type: String
  },
  fleetUrl: {
    type: String,
    required: 'fleet url is required'
  }
}, {
  read: 'nearest'
});



EnvironmentSchema.plugin(timestamps);
mongoose.model('Environment', EnvironmentSchema);
var Environment = mongoose.model('Environment');
BBPromise.promisifyAll(Environment);
BBPromise.promisifyAll(Environment.prototype);

module.exports = Environment;
