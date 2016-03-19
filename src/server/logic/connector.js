import {
  ConnectorSetting
} from '@hoist/model';
import fs from 'fs';
import Bluebird from 'bluebird';
import logger from '@hoist/logger';
import path from 'path';
import config from 'config';
import url from 'url';
import r from 'request';
Bluebird.promisifyAll(r);
Bluebird.promisifyAll(fs);
const _logger = logger.child({
  cls: 'ConnectorLogic'
});
/**
 * returns all connnectors for this application
 * @param {string} applicationId - the id of the application to use
 * @returns {Promise<Array<ConnectorViewModel>>} - the connectors
 */
export function getConnectorsForApplication(applicationId) {
  return Promise
    .resolve(ConnectorSetting.findAsync({
      application: applicationId
    }))
    .then((connectorSettings) => Promise.all(connectorSettings.map(connectorSetting => populateConnector(connectorSetting))));
}
/**
 * given a connector setting, returns an object loading up the settings and the events that come from the connector
 * @param {ConnectorSetting} connectorSetting - the connector setting to populate
 * @returns {Promise<ConnectorViewModel>} - the connector view model
 */
export function populateConnector(connectorSetting) {
  let ConnectorViewModel = require('../models/connector_view_model')
    .ConnectorViewModel;
  return Promise
    .resolve()
    .then(() => {
      let model = new ConnectorViewModel(connectorSetting);
      return model
        .populate()
        .then(() => model);
    })
}
export function loadConnector(applicationId, connectorKey) {
  return ConnectorSetting
    .findOneAsync({
      key: connectorKey,
      application: applicationId
    })
    .then((connectorSetting) => {
      if (connectorSetting) {
        return populateConnector(connectorSetting);
      }
    })
}
export function getAvailableConnectors() {
  return Promise
    .resolve()
    .then(() => {
      return fs.readdirAsync(config.get('Hoist.filePaths.connectors'));
    })
    .then((directoryListing) => {
      _logger.info('directory listing retrieved');
      return Promise.all(directoryListing.map((file) => {
        return fs.statAsync(path.join(config.get('Hoist.filePaths.connectors'), file))
          .then((stat) => {
            return {
              dir: file,
              isDirectory: stat.isDirectory()
            };
          });
      }));
    })
    .then((listingMappings) => {
      return listingMappings.filter((listing) => {
        return listing.isDirectory;
      });
    })
    .then((connectors) => {
      var rootDirectory = path.resolve(config.get('Hoist.filePaths.connectors'));
      return Promise.all(connectors.map((connector) => {
        return fs
          .realpathAsync(path.join(rootDirectory, connector.dir, 'current'))
          .then((connectorDir) => {
            let settingsPath = path.join(connectorDir, 'connector.json');
            if (!fs.existsSync(settingsPath)) {
              return null;
            } else {
              return require(settingsPath);
            }
          })
          .then((settings) => {
            return Object.assign({}, {
              settings
            }, {
              key: connector.dir
            });
          });
      }));
    })
    .catch(function (err) {
      _logger.alert(err);
      _logger.error(err);
      throw err;
      return [];
    });
}
export function setupDefaultConnector(application, connectorType) {

  //find the root connector settings
  return ConnectorSetting.findOneAsync({
      application: config.get('Hoist.admin.applicationId'),
      key: 'hoist-root-' + connectorType
    })
    .then((rootConnectorSetting) => {
      _logger.info({
        rootConnectorSetting
      }, 'root connector loaded');
      let connectorKey = rootConnectorSetting.defaultKey || connectorType.replace('hoist-connector-', '');
      _logger.info({
        connectorKey
      }, 'connector key');
      return getUniqueConnectorKey(connectorKey, application._id)
        .then((key) => {
          let {
            name,
            settings,
            connectorType
          } = rootConnectorSetting;
          let newConnectorSettings = {
            application: application,
            name,
            settings,
            key,
            connectorType,
            environment: 'live'
          };
          return new ConnectorSetting(newConnectorSettings)
            .saveAsync();
        });
    });
}
export function getUniqueConnectorKey(candidateKey, applicationId, append) {
  let key = candidateKey;
  if (append) {
    key = key + append;
  }
  return ConnectorSetting
    .countAsync({
      application: applicationId,
      key
    })
    .then((count) => {
      if (count > 0) {
        return getUniqueConnectorKey(candidateKey, applicationId, Math.round(Math.random() * 1000))
      }
      return key;
    });
}
export function getAuthUrl(connector, organisationSlug, applicationSlug, bucketKey = 'default') {
  return Promise.resolve()
    .then(() => {
      let returnUrl = url.format({
        protocol: config.get('Hoist.cookies.portal.secure') ? 'https' : 'http',
        host: config.get("Hoist.domains.portal"),
        pathname: `/${organisationSlug}/${applicationSlug}/connector/${connector.key}`
      });
      let uri = {
        protocol: config.get('Hoist.cookies.portal.secure') ? 'https' : 'http',
        host: config.get("Hoist.domains.bouncer"),
        pathname: `/initiate/${organisationSlug}/${applicationSlug}/${connector.key}`,
        query: {
          bucketKey,
          returnUrl
        }
      };
      return r.getAsync(url.format(uri), {
        followRedirect: false
      });
    })
    .then((response) => {
      if (response.statusCode !== 302) {
        throw new Error('unexpected response from Bouncer');
      }
      return response.headers.location;
    });
}
