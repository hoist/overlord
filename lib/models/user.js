'use strict';
var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
var BBPromise = require('bluebird');
var Schema = mongoose.Schema;
var config = require('config');
var validator = require('validator');
var bcrypt = BBPromise.promisifyAll(require('bcrypt'));

var UserSchema = new Schema({
  name: {
    type: String
  },
  username: {
    type: String,
    index: true,
    unique: true,
    required: 'email address is required',
    validate: [
      function (email) {
        return validator.isEmail(email);
      }, 'the email address {VALUE} is not valid'
    ]
  },
  passwordHash: {
    type: String
  },
  passwordResetDate: {
    type: Date
  }
}, {
  read: 'nearest'
});

UserSchema.method({
  verifyPassword: function (password) {
    return bcrypt.compareSync(password, this.passwordHash);
  },
  setPassword: function (password, callback) {
    return BBPromise.try(function () {
      return bcrypt.genSaltAsync(config.get('Hoist.security.passwordStrength'));
    }).bind(this).then(function (salt) {
      return bcrypt.hashAsync(password, salt);
    }).then(function (passwordHash) {
      this.passwordHash = passwordHash;
      this.passwordResetDate = Date.now();
      return this;
    }).nodeify(callback);
  }
});

UserSchema.plugin(timestamps);
mongoose.model('User', UserSchema);

var User = mongoose.model('User');
BBPromise.promisifyAll(User);
BBPromise.promisifyAll(User.prototype);
module.exports = User;
