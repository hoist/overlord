'use strict';
var APIToken = require('../lib/models/api_token');
exports.up = function (next) {
  console.log('    --> This is migration 2015-05-26-1136-add-api-token.js being applied');
  var apiToken = new APIToken({
    name: 'Circle CI',
    token: 'xc1zrzacmxp9samlj9nya4gzay'
  });
  apiToken.saveAsync()
    .spread(function (token) {
      console.log('created CircleCI api token:', token.token);
      next();
    });
};


exports.down = function (next) {
  console.log('    --> This is migration 2015-05-26-1136-add-api-token.js being rollbacked');
  APIToken.removeAsync({
      name: 'Circle CI'
    })
    .then(function () {
      next();
    });
};
