'use strict';
import timestamps from 'mongoose-timestamp';
import BBPromise from 'bluebird';
import semverUtils from 'semver-utils';
import connectionManager from './connection_manager';
import {
  Schema
}
from 'mongoose';

var ProjectDeployConfigurationSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    indexed: true
  },
  environment: {
    type: Schema.Types.ObjectId,
    ref: 'Environment'
  },
  nextReleaseNumber: {
    type: String,
    required: true
  },
  serviceConfig: {
    type: String,
    required: true
  },
  scale: {
    type: Number,
    default: 3
  },
  vcs: {
    branch: {
      type: String,
      required: true,
      default: 'master'
    }
  }
}, {
  read: 'nearest'
});

ProjectDeployConfigurationSchema.plugin(timestamps);
ProjectDeployConfigurationSchema.method('incrementVersion', function () {
  var semVerVersion = semverUtils.parse(this.nextReleaseNumber);
  semVerVersion.patch++;
  this.nextReleaseNumber = semverUtils.stringify(semVerVersion);
  return this.saveAsync();
});
connectionManager.connection.model('ProjectDeployConfiguration', ProjectDeployConfigurationSchema);
var ProjectDeployConfiguration = connectionManager.connection.model('ProjectDeployConfiguration');
BBPromise.promisifyAll(ProjectDeployConfiguration);
BBPromise.promisifyAll(ProjectDeployConfiguration.prototype);

export default ProjectDeployConfiguration;
