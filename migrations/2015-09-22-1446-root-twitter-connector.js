'use strict';
require('../config/migration_bootstrap');
var ConnectorSetting = require('@hoist/model').ConnectorSetting
var config = require('config');
var Bluebird = require('bluebird');
exports.up = function (next) {
  console.log('    --> This is migration 2015-09-22-1446-root-twitter-connector.js being applied');
  var connectorSetting = new ConnectorSetting({
    application: 'mQqxktcK3Dx7DHa5tyON',
    environment: 'live',
    connectorType: 'hoist-connector-twitter',
    settings: {
      authType: 'Public',
      consumerKey: 'tUASliMsmTzvBzmsfTY4QANxP',
      consumerSecret: 'P9QVUIbY9KIzpG00Y9kgrsGYRn0ZrCl1aWKbdKlU8T9FyLIifi'
    },
    name: "twitter",
    key: "hoist-root-hoist-connector-twitter",
  });
  var testConnectorSetting = new ConnectorSetting({
    application: 'docker-admin-app',
    environment: 'live',
    connectorType: 'hoist-connector-twitter',
    settings: {
      authType: 'Public',
      consumerKey: 'ODvxSlAsb1XDkGyK9N27PrUFk',
      consumerSecret: 'nrPwqz6YP5mqLekHpFHMXXbteqogmMYAhrbPvaulTcksGHoaNe'
    },
    name: "twitter",
    key: "hoist-root-hoist-connector-twitter",
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
  console.log('    --> This is migration 2015-09-22-1446-root-twitter-connector.js being rollbacked');
  return Bluebird.all([
    ConnectorSetting.removeAsync({
      application: 'mQqxktcK3Dx7DHa5tyON',
      key: "hoist-root-hoist-connector-twitter"
    }), ConnectorSetting.removeAsync({
      application: 'docker-admin-app',
      key: "hoist-root-hoist-connector-twitter"
    })
  ]).then(function () {
    console.log('connector setting saved');
    next();
  }).catch(function (err) {
    console.warn(err.message);
    next(err);
  });
};
