'use strict';
import timestamps from 'mongoose-timestamp';
import BBPromise from 'bluebird';
import validate from 'mongoose-validator';
import slug from 'mongoose-slug';
import connectionManager from './connection_manager';
import {
  Schema
}
from 'mongoose';

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


EnvironmentSchema.set('toJSON', {
  getters: true,
  virtuals: true,
  minimize: false
});
EnvironmentSchema.plugin(timestamps);
EnvironmentSchema.plugin(slug('name', {
  unique: true,
  required: true
}));
EnvironmentSchema.index({
  slug: 1
});
connectionManager.connection.model('Environment', EnvironmentSchema);
var Environment = connectionManager.connection.model('Environment');
BBPromise.promisifyAll(Environment);
BBPromise.promisifyAll(Environment.prototype);

export default Environment;
