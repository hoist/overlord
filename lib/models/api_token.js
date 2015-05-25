'use strict';
var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
var BBPromise = require('bluebird');
var Schema = mongoose.Schema;
var APITokenSchema = new Schema({
	token: {
		type: String
	}
}, {
	read: 'nearest'
});

APITokenSchema.plugin(timestamps);
mongoose.model('APIToken', APITokenSchema);
var APIToken = mongoose.model('APIToken');
BBPromise.promisifyAll(APIToken);
BBPromise.promisifyAll(APIToken.prototype);

module.exports = APIToken;
