'use strict';
var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
var BBPromise = require('bluebird');
var validate = require('mongoose-validator');
var slug = require('mongoose-slug');
var Schema = mongoose.Schema;

var nameValidator = [
  validate({
    validator: 'isLength',
    arguments: [1, 50],
    message: 'Name should be between 1 and 50 characters'
  })
];

var fleetUrlValidator = [
  validate({
    validator: 'isLength',
    arguments: [1, 100],
    message: 'Fleet URL should be between 1 and 100 characters'
  }),
  validate({
    validator: 'isURL',
    arguments: {
      /* eslint camelcase:0 */
      require_prototcol: true
    },
    passIfEmpty: false,
    message: 'Fleet URL must be a valid absolute URL'
  })
];


var EnvironmentSchema = new Schema({
  name: {
    type: String,
    required: 'name is required',
    index: {
      unique: 'name must be unique'
    },
    validate: nameValidator
  },
  tag: {
    type: String
  },
  fleetUrl: {
    type: String,
    required: 'fleet url is required',
    validate: fleetUrlValidator
  }
}, {
  read: 'nearest'
});



EnvironmentSchema.plugin(timestamps);
EnvironmentSchema.plugin(slug('name', {
  unique: true,
  required: true
}));
EnvironmentSchema.index({
  slug: 1
});
mongoose.model('Environment', EnvironmentSchema);
var Environment = mongoose.model('Environment');
BBPromise.promisifyAll(Environment);
BBPromise.promisifyAll(Environment.prototype);

module.exports = Environment;
