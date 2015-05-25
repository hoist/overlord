'use strict';
var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
var BBPromise = require('bluebird');
var Schema = mongoose.Schema;
var ProjectDeploymentSchema = new Schema({
	project: {
		type: Schema.Types.ObjectId,
		ref: 'Project'
	},
	environment: {
		type: Schema.Types.ObjectId,
		ref: 'Environment'
	},
	releaseNumber: {
		type: String,
		required: true
	}
}, {
	read: 'nearest'
});



ProjectDeploymentSchema.plugin(timestamps);
mongoose.model('ProjectDeployment', ProjectDeploymentSchema);
var ProjectDeployment = mongoose.model('ProjectDeployment');
BBPromise.promisifyAll(ProjectDeployment);
BBPromise.promisifyAll(ProjectDeployment.prototype);

module.exports = ProjectDeployment;
