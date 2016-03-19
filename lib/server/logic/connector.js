'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getConnectorsForApplication = getConnectorsForApplication;
exports.populateConnector = populateConnector;
exports.loadConnector = loadConnector;
exports.getAvailableConnectors = getAvailableConnectors;
exports.setupDefaultConnector = setupDefaultConnector;
exports.getUniqueConnectorKey = getUniqueConnectorKey;
exports.getAuthUrl = getAuthUrl;

var _model = require('@hoist/model');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _logger2 = require('@hoist/logger');

var _logger3 = _interopRequireDefault(_logger2);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _config = require('config');

var _config2 = _interopRequireDefault(_config);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_bluebird2.default.promisifyAll(_request2.default);
_bluebird2.default.promisifyAll(_fs2.default);
var _logger = _logger3.default.child({
  cls: 'ConnectorLogic'
});
/**
 * returns all connnectors for this application
 * @param {string} applicationId - the id of the application to use
 * @returns {Promise<Array<ConnectorViewModel>>} - the connectors
 */
function getConnectorsForApplication(applicationId) {
  return Promise.resolve(_model.ConnectorSetting.findAsync({
    application: applicationId
  })).then(function (connectorSettings) {
    return Promise.all(connectorSettings.map(function (connectorSetting) {
      return populateConnector(connectorSetting);
    }));
  });
}
/**
 * given a connector setting, returns an object loading up the settings and the events that come from the connector
 * @param {ConnectorSetting} connectorSetting - the connector setting to populate
 * @returns {Promise<ConnectorViewModel>} - the connector view model
 */
function populateConnector(connectorSetting) {
  var ConnectorViewModel = require('../models/connector_view_model').ConnectorViewModel;
  return Promise.resolve().then(function () {
    var model = new ConnectorViewModel(connectorSetting);
    return model.populate().then(function () {
      return model;
    });
  });
}
function loadConnector(applicationId, connectorKey) {
  return _model.ConnectorSetting.findOneAsync({
    key: connectorKey,
    application: applicationId
  }).then(function (connectorSetting) {
    if (connectorSetting) {
      return populateConnector(connectorSetting);
    }
  });
}
function getAvailableConnectors() {
  return Promise.resolve().then(function () {
    return _fs2.default.readdirAsync(_config2.default.get('Hoist.filePaths.connectors'));
  }).then(function (directoryListing) {
    _logger.info('directory listing retrieved');
    return Promise.all(directoryListing.map(function (file) {
      return _fs2.default.statAsync(_path2.default.join(_config2.default.get('Hoist.filePaths.connectors'), file)).then(function (stat) {
        return {
          dir: file,
          isDirectory: stat.isDirectory()
        };
      });
    }));
  }).then(function (listingMappings) {
    return listingMappings.filter(function (listing) {
      return listing.isDirectory;
    });
  }).then(function (connectors) {
    var rootDirectory = _path2.default.resolve(_config2.default.get('Hoist.filePaths.connectors'));
    return Promise.all(connectors.map(function (connector) {
      return _fs2.default.realpathAsync(_path2.default.join(rootDirectory, connector.dir, 'current')).then(function (connectorDir) {
        var settingsPath = _path2.default.join(connectorDir, 'connector.json');
        if (!_fs2.default.existsSync(settingsPath)) {
          return null;
        } else {
          return require(settingsPath);
        }
      }).then(function (settings) {
        return Object.assign({}, {
          settings: settings
        }, {
          key: connector.dir
        });
      });
    }));
  }).catch(function (err) {
    _logger.alert(err);
    _logger.error(err);
    throw err;
    return [];
  });
}
function setupDefaultConnector(application, connectorType) {

  //find the root connector settings
  return _model.ConnectorSetting.findOneAsync({
    application: _config2.default.get('Hoist.admin.applicationId'),
    key: 'hoist-root-' + connectorType
  }).then(function (rootConnectorSetting) {
    _logger.info({
      rootConnectorSetting: rootConnectorSetting
    }, 'root connector loaded');
    var connectorKey = rootConnectorSetting.defaultKey || connectorType.replace('hoist-connector-', '');
    _logger.info({
      connectorKey: connectorKey
    }, 'connector key');
    return getUniqueConnectorKey(connectorKey, application._id).then(function (key) {
      var name = rootConnectorSetting.name;
      var settings = rootConnectorSetting.settings;
      var connectorType = rootConnectorSetting.connectorType;

      var newConnectorSettings = {
        application: application,
        name: name,
        settings: settings,
        key: key,
        connectorType: connectorType,
        environment: 'live'
      };
      return new _model.ConnectorSetting(newConnectorSettings).saveAsync();
    });
  });
}
function getUniqueConnectorKey(candidateKey, applicationId, append) {
  var key = candidateKey;
  if (append) {
    key = key + append;
  }
  return _model.ConnectorSetting.countAsync({
    application: applicationId,
    key: key
  }).then(function (count) {
    if (count > 0) {
      return getUniqueConnectorKey(candidateKey, applicationId, Math.round(Math.random() * 1000));
    }
    return key;
  });
}
function getAuthUrl(connector, organisationSlug, applicationSlug) {
  var bucketKey = arguments.length <= 3 || arguments[3] === undefined ? 'default' : arguments[3];

  return Promise.resolve().then(function () {
    var returnUrl = _url2.default.format({
      protocol: _config2.default.get('Hoist.cookies.portal.secure') ? 'https' : 'http',
      host: _config2.default.get("Hoist.domains.portal"),
      pathname: '/' + organisationSlug + '/' + applicationSlug + '/connector/' + connector.key
    });
    var uri = {
      protocol: _config2.default.get('Hoist.cookies.portal.secure') ? 'https' : 'http',
      host: _config2.default.get("Hoist.domains.bouncer"),
      pathname: '/initiate/' + organisationSlug + '/' + applicationSlug + '/' + connector.key,
      query: {
        bucketKey: bucketKey,
        returnUrl: returnUrl
      }
    };
    return _request2.default.getAsync(_url2.default.format(uri), {
      followRedirect: false
    });
  }).then(function (response) {
    if (response.statusCode !== 302) {
      throw new Error('unexpected response from Bouncer');
    }
    return response.headers.location;
  });
}
//# sourceMappingURL=../../maps/server/logic/connector.js.map
