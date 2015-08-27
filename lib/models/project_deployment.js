'use strict';
import timestamps from 'mongoose-timestamp';
import BBPromise from 'bluebird';
import connectionManager from './connection_manager';
import {
  Schema
}
from 'mongoose';
var ProjectDeploymentSchema = new Schema({
  deployConfiguration: {
    type: Schema.Types.ObjectId,
    ref: 'ProjectDeployConfiguration',
    indexed: true
  },
  projectBuild: {
    type: Schema.Types.ObjectId,
    ref: 'ProjectBuild'
  },
  releaseNumber: {
    type: String,
    required: true
  }
}, {
  read: 'nearest'
});



ProjectDeploymentSchema.plugin(timestamps);
connectionManager.connection.model('ProjectDeployment', ProjectDeploymentSchema);
var ProjectDeployment = connectionManager.connection.model('ProjectDeployment');
BBPromise.promisifyAll(ProjectDeployment);
BBPromise.promisifyAll(ProjectDeployment.prototype);

export default ProjectDeployment;
