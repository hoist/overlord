'use strict';
import timestamps from 'mongoose-timestamp';
import BBPromise from 'bluebird';
import connectionManager from './connection_manager';
import {
  Schema
}
from 'mongoose';

var ProjectBuildSchema = new Schema({
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project'
  },
  branch: {
    type: String
  },
  build: {
    type: Number
  },
  sha1: {
    type: String
  },
  compareUrl: {
    type: String
  },
  log: {
    type: Schema.Types.Mixed
  },
  publisher: {
    type: Schema.Types.ObjectId,
    ref: 'APIToken'
  }
}, {
  read: 'nearest'
});



ProjectBuildSchema.plugin(timestamps);
connectionManager.connection.model('ProjectBuild', ProjectBuildSchema);
var ProjectBuild = connectionManager.connection.model('ProjectBuild');
BBPromise.promisifyAll(ProjectBuild);
BBPromise.promisifyAll(ProjectBuild.prototype);

export default ProjectBuild;
