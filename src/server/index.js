'use strict';
import {Server as HapiServer} from 'hapi';
import Bluebird from 'bluebird';
import configurators from './configuration';
import logger from '@hoist/logger';
import hapi from 'hapi';
import config from 'config';
import {_mongoose} from '@hoist/model';
_mongoose.set('debug', true);
/**
 * The main portal server itself
 */

export default class PortalServer {
  /**
   * create a new portal server
   */
  constructor () {
    this._logger = logger.child({cls: this.constructor.name});
  }
  _createServer () {
    return Promise
      .resolve()
      .then(() => {
        this._hapiServer = new HapiServer();
        Bluebird.promisifyAll(this._hapiServer);
      })
      .then(() => configurators.server.configure(this._hapiServer))
      .then(() => configurators.logging.configure(this._hapiServer))
      .then(() => configurators.auth.configure(this._hapiServer))
      .then(() => configurators.routes.configure(this._hapiServer))
      .then(() => this._hapiServer);
  }

  /**
   * start the server and connect to mongo
   * @returns {Promise} - for the server to have started
   */
  start () {
    return _mongoose
      .connectAsync(config.get('Hoist.mongo.core.connectionString'))
      .then(() => this._createServer())
      .then(() => this._hapiServer.startAsync())
      .then(() => {
        this
          ._logger
          .info({
            info: this._hapiServer.info
          }, 'server listening')
      })
      .catch((err) => {
        this
          ._logger
          .error(err);
        this
          ._logger
          .alert(err);
      });
  }
}
