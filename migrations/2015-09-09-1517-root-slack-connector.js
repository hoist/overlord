'use strict';
require('../config/migration_bootstrap');
var ConnectorSetting = require('@hoist/model').ConnectorSetting
var config = require('config');
var Bluebird = require('bluebird');
exports.up = function (next) {
  console.log('    --> This is migration 2015-09-09-1517-root-slack-connector.js being applied');
  var connectorSetting = new ConnectorSetting({
    application: 'mQqxktcK3Dx7DHa5tyON',
    environment: 'live',
    connectorType: 'hoist-connector-slack',
    settings: {
      "clientSecret": "702f53e4ef4cd98b8c77b77e2ee0f48d",
      "clientId": "4070343459.10366083296",
      "authType": "Public"
    },
    name: "slack",
    key: "hoist-root-hoist-connector-slack",
  });
  var testConnectorSetting = new ConnectorSetting({
    application: 'docker-admin-app',
    environment: 'live',
    connectorType: 'hoist-connector-slack',
    settings: {
      "clientSecret": "6c3a73833fd6303b4c8d992f21429ff4",
      "clientId": "4070343459.10715198198",
      "authType": "Public"
    },
    name: "slack",
    key: "hoist-root-hoist-connector-slack",
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
  console.log('    --> This is migration 2015-09-09-1517-root-slack-connector.js being rollbacked');
  return Bluebird.all([
    ConnectorSetting.removeAsync({
      application: 'mQqxktcK3Dx7DHa5tyON',
      key: "hoist-root-hoist-connector-slack"
    }), ConnectorSetting.removeAsync({
      application: 'docker-admin-app',
      key: "hoist-root-hoist-connector-slack"
    })
  ]).then(function () {
    console.log('connector setting saved');
    next();
  }).catch(function (err) {
    console.warn(err.message);
    next(err);
  });
}
