'use strict';
var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
var BBPromise = require('bluebird');
var Schema = mongoose.Schema;
var randomToken = require('random-token');
var APITokenSchema = new Schema({
  token: {
    type: String,
    unique: true,
    index: true,
    default: function () {
      return randomToken(26);
    }
  },
  name: {
    type: String,
    required: true,
    unique: true
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
