'use strict';
var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
var BBPromise = require('bluebird');
var Schema = mongoose.Schema;
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
mongoose.model('ProjectBuild', ProjectBuildSchema);
var ProjectBuild = mongoose.model('ProjectBuild');
BBPromise.promisifyAll(ProjectBuild);
BBPromise.promisifyAll(ProjectBuild.prototype);

module.exports = ProjectBuild;
