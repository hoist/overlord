'use strict';
require('../config/migration_bootstrap');
var ConnectorSetting = require('@hoist/model').ConnectorSetting
var config = require('config');
var Bluebird = require('bluebird');
exports.up = function (next) {
  console.log('    --> This is migration 2015-10-07-1404-root-github-connector.js being applied');
  var connectorSetting = new ConnectorSetting({
    application: 'mQqxktcK3Dx7DHa5tyON',
    environment: 'live',
    connectorType: 'hoist-connector-github',
    settings: {
      "authType": "Public",
      "clientId": "f179470969ab4ebd2b56",
      "clientSecret": "e41f3c82a99d73421591049eb8cec69323b910d9",
      "scope": "user,repo,admin:repo_hook,notifications"
    },
    name: "github",
    key: "hoist-root-hoist-connector-github",
  });
  var testConnectorSetting = new ConnectorSetting({
    application: 'docker-admin-app',
    environment: 'live',
    connectorType: 'hoist-connector-github',
    settings: {
      "authType": "Public",
      "clientId": "9f976311314247d88358",
      "clientSecret": "46f88b928ab60defd07d5c0f048a583718e52143",
      "scope": "user,repo,admin:repo_hook,notifications"
    },
    name: "github",
    key: "hoist-root-hoist-connector-github",
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
  console.log('    --> This is migration 2015-10-07-1404-root-github-connector.js being rollbacked');
  return Bluebird.all([
    ConnectorSetting.removeAsync({
      application: 'mQqxktcK3Dx7DHa5tyON',
      key: "hoist-root-hoist-connector-github"
    }), ConnectorSetting.removeAsync({
      application: 'docker-admin-app',
      key: "hoist-root-hoist-connector-github"
    })
  ]).then(function () {
    console.log('connector setting saved');
    next();
  }).catch(function (err) {
    console.warn(err.message);
    next(err);
  });
};