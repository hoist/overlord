'use strict';
var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
var BBPromise = require('bluebird');
var Schema = mongoose.Schema;
var ProjectSchema = new Schema({
	name: {
		type: String
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
			required: true
		},
		repository: {
			type: String,
			required: true
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
