'use strict';
var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
var BBPromise = require('bluebird');
var validate = require('mongoose-validator');
var Schema = mongoose.Schema;
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
mongoose.model('Project', ProjectSchema);
var Project = mongoose.model('Project');
BBPromise.promisifyAll(Project);
BBPromise.promisifyAll(Project.prototype);

module.exports = Project;
