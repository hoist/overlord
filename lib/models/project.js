'use strict';

import timestamps from 'mongoose-timestamp';
import BBPromise from 'bluebird';
import validate from 'mongoose-validator';
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
var ProjectSchema = new Schema({
  name: {
    type: String,
    required: 'name is required',
    validate: nameValidator
  },
  status: {
    type: String,
    enum: ['PENDING', 'ACTIVE'],
    default: 'PENDING',
    required: true
  },
  currentDeployments: [{
    type: Schema.Types.ObjectId,
    ref: 'ProjectDeployment'
  }],
  vcs: {
    username: {
      type: String,
      required: 'VCS Username is required'
    },
    repository: {
      type: String,
      required: 'VCS Repository is required'
    }
  }
}, {
  read: 'nearest'
});



ProjectSchema.plugin(timestamps);
connectionManager.connection.model('Project', ProjectSchema);
var Project = connectionManager.connection.model('Project');
BBPromise.promisifyAll(Project);
BBPromise.promisifyAll(Project.prototype);

module.exports = Project;
