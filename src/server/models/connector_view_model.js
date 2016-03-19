import fs from 'fs';
import Promise from 'bluebird';
import path from 'path';
import config from 'config';
import _ from 'lodash';
import bluebird from 'bluebird';

bluebird.promisifyAll(fs);
/**
 * this is a cut down class for views to look at connector settings
 */
export class ConnectorViewModel {
  /**
   * create a new connector view model from ConnectorSetting
   * @param {ConnectorSetting} connectorSetting
   */
  constructor (connectorSetting) {
    this._connectorSetting = connectorSetting
  }
  _connectorPath () {
    return path.resolve(path.join(config.get('Hoist.filePaths.connectors'), this.type, 'current'));
  }

  /**
   * @returns {string} - the key for this connector
   */
  get key () {
    return this._connectorSetting.key;
  }

  /**
   * @returns {String} the name of this connector
   */
  get name () {
    return this._connectorSetting.name;
  }

  /**
   * @returns {string} the type of this connector
   */
  get type () {
    return this._connectorSetting.connectorType;
  }

  /**
   * @returns {Object} the settings for this connector
   */
  get settings () {
    return this._connectorSetting.settings;
  }

  /**
   * @returns {Array<Object>} a list of available events for this connector
   */
  get events () {
    return this._events;
  }

  codeForEvent (event) {
    //returns the sample code for an event for this connector
    return Promise
      .resolve()
      .then(() => {
        let codePath = path.join(this._connectorPath(), 'samples', `${event.name}.js`);
        if (!fs.existsSync(codePath)) {
          return null;
        } else {
          return fs.readFileAsync(codePath, {encoding: 'utf8'});
        }
      })
  }

  /**
   * populates the parts of the model that can't be done syncronously
   * @returns {Promise} when the model has been populated
   */
  populate () {
    return Promise
      .resolve()
      .then(() => {
        //load up the connector.json
        return require(path.join(this._connectorPath(), 'connector.json'))
      })
      .then((connectorJson) => {
        this._connectorJson = connectorJson;
        if (connectorJson.events) {
          return connectorJson
            .events
            .map(({description, name}) => ({description: description, name: name, connector: `${this.key}`, key: `${this.key}:${name}`}));
        } else {
          return _.flatten(_.map(connectorJson.endpoints, (endpoint, name) => {
            let eventsNames;
            if (endpoint.events) {
              return endpoint
                .events
                .map((eventName) => ({description: '', name: `${eventName}:${name}`, connector: `${this.key}`, key: `${this.key}:${eventName}:${name}`}));
            } else {
              return [
                {
                  description: '',
                  name: `new:${name}`,
                  connector: `${this.key}`,
                  key: `${this.key}:new:${name}`
                }, {
                  description: '',
                  name: `modified:${name}`,
                  connector: `${this.key}`,
                  key: `${this.key}:modified:${name}`
                }, {
                  description: '',
                  name: `deleted:${name}`,
                  connector: `${this.key}`,
                  key: `${this.key}:deleted:${name}`
                }
              ]
            }
          }));
        }
      })
      .then((events) => {
        this._events = events;
      });
  }
  toJSON () {
    return Object.assign({}, {
      key: this.key,
      name: this.name,
      events: this.events,
      settings: this.settings,
      type: this.type
    });
  }
}
