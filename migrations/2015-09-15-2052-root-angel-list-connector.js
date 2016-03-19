'use strict';
require('../config/migration_bootstrap');
var ConnectorSetting = require('@hoist/model').ConnectorSetting
var config = require('config');
var Bluebird = require('bluebird');
exports.up = function (next) {
  console.log('    --> This is migration 2015-09-15-2052-root-angel-list-connector.js being applied');
  var connectorSetting = new ConnectorSetting({
    application: 'mQqxktcK3Dx7DHa5tyON',
    environment: 'live',
    connectorType: 'hoist-connector-angel-list',
    settings: {
      authType: 'Authorized',
      clientId: 'c4a066383a9dbe967358318c56facf7f38a49834078f8bfb',
      clientSecret: '9ab9d06519f7368cd1a7c5171476d9074dd3604656b0ba4d'
    },
    name: "angel-list",
    key: "hoist-root-hoist-connector-angel-list",
  });
  var testConnectorSetting = new ConnectorSetting({
    application: 'docker-admin-app',
    environment: 'live',
    connectorType: 'hoist-connector-angel-list',
    settings: {
      authType: 'Authorized',
      clientId: '840c3f897e778d6bc6dc4c3dd8ec1ab557fdb2548fe48c5a',
      clientSecret: '558e2ce69159ede52eb09dd3329236ddec60da3234075889'
    },
    name: "angel-list",
    key: "hoist-root-hoist-connector-angel-list",
  });
  return Bluebird.all([
      connectorSetting.saveAsync(),
      testConnectorSetting.saveAsync()
    ])
    .then(function () {
      console.log('connector setting saved');
      next();
    }).catch(function (err) {
      console.warn(err.message);
      next(err);
    });
};


exports.down = function (next) {
  console.log('    --> This is migration 2015-09-15-2052-root-angel-list-connector.js being rollbacked');
  return Bluebird.all([
    ConnectorSetting.removeAsync({
      application: 'mQqxktcK3Dx7DHa5tyON',
      key: "hoist-root-hoist-connector-angel-list"
    }), ConnectorSetting.removeAsync({
      application: 'docker-admin-app',
      key: "hoist-root-hoist-connector-angel-list"
    })
  ]).then(function () {
    console.log('connector setting saved');
    next();
  }).catch(function (err) {
    console.warn(err.message);
    next(err);
  });
};
