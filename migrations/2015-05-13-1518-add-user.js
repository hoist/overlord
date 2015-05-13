'use strict';
var User = require('../lib/models/user');
exports.up = function (next) {
  console.log('    --> This is migration 2015-05-13-1518-add.js being applied');
  var user = new User({
    username: 'support@hoist.io',
    name: 'Hoist Support'
  });
  user.setPassword('support').then(function () {
    return user.saveAsync();
  }).then(function () {
    console.log('user saved');
    next();
  }).catch(function (err) {
    console.warn(err.message);
    next(err);
  });
};


exports.down = function (next) {
  console.log('    --> This is migration 2015-05-13-1518-add.js being rollbacked');
  User.removeAsync({
    username: 'support@hoist.io'
  }).then(function () {
    console.log('support user removed');
    next();
  }).catch(function (err) {
    console.warn(err.message);
    next(err);
  });

};
