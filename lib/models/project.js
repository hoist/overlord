'use strict';
var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
var BBPromise = require('bluebird');
var Schema = mongoose.Schema;
var projectStatus = ['PENDING', 'ACTIVE'];
var ProjectSchema = new Schema({
	name: {
		type: String
	},
	status: {
		type: String,
		enum: projectStatus
	},
	currentRelease: {
		type: String
	},
	currentDeployments: [{
		type: Schema.Types.ObjectId,
		ref: 'ProjectDeployment'
	}]
}, {
	read: 'nearest'
});



ProjectSchema.plugin(timestamps);
mongoose.model('Project', ProjectSchema);
var Project = mongoose.model('Project');
BBPromise.promisifyAll(Project);
BBPromise.promisifyAll(Project.prototype);

module.exports = Project;
