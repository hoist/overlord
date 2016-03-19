'use strict';
require('../config/migration_bootstrap');
var ConnectorSetting = require('@hoist/model').ConnectorSetting
var config = require('config');
var Bluebird = require('bluebird');
exports.up = function (next) {
  console.log('    --> This is migration 2015-09-16-1533-root-highrise-connector.js being applied');
  var connectorSetting = new ConnectorSetting({
    application: 'mQqxktcK3Dx7DHa5tyON',
    environment: 'live',
    connectorType: 'hoist-connector-highrise',
    settings: {
      authType: 'Public',
      clientId: '17a84dd7f6d718b5b9254c0e4567a2630d865a54',
      clientSecret: 'bf3d9e9b373b01f267f9c1e877dedcf8474024ad'
    },
    name: "highrise",
    key: "hoist-root-hoist-connector-highrise",
  });
  var testConnectorSetting = new ConnectorSetting({
    application: 'docker-admin-app',
    environment: 'live',
    connectorType: 'hoist-connector-highrise',
    settings: {
      authType: 'Public',
      clientId: '23699f053f105911d6f1bea90cca8e575f94c3de',
      clientSecret: 'e22df04eaa1ae92c1ef463bbf872cd61fc3d0f5c'
    },
    name: "highrise",
    key: "hoist-root-hoist-connector-highrise",
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
  console.log('    --> This is migration 2015-09-16-1533-root-highrise-connector.js being rollbacked');
  return Bluebird.all([
    ConnectorSetting.removeAsync({
      application: 'mQqxktcK3Dx7DHa5tyON',
      key: "hoist-root-hoist-connector-highrise"
    }), ConnectorSetting.removeAsync({
      application: 'docker-admin-app',
      key: "hoist-root-hoist-connector-highrise"
    })
  ]).then(function () {
    console.log('connector setting saved');
    next();
  }).catch(function (err) {
    console.warn(err.message);
    next(err);
  });
};
