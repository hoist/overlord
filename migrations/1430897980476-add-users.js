'use strict';
require('./bootstrap');
var User = require('../lib/models/user');
exports.up = function (next) {
  var user = new User({
    username: 'support@hoist.io',
    name: 'Hoist Support'
  });
  user.setPassword('support').then(function () {
    return user.saveAsync();
  }).then(function () {

    next();
  });
};

exports.down = function (next) {
  User.removeAsync({
    username: 'support@hoist.io'
  }).then(function () {
    next();
  });
};
