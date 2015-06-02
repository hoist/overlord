'use strict';
var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
var BBPromise = require('bluebird');
var semverUtils = require('semver-utils');

var Schema = mongoose.Schema;

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
mongoose.model('ProjectDeployConfiguration', ProjectDeployConfigurationSchema);
var ProjectDeployConfiguration = mongoose.model('ProjectDeployConfiguration');
BBPromise.promisifyAll(ProjectDeployConfiguration);
BBPromise.promisifyAll(ProjectDeployConfiguration.prototype);

module.exports = ProjectDeployConfiguration;
