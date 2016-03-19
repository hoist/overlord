import {
  BaseController
} from '../base_controller';
import {
  ConnectorLogic
} from '../../logic';
import errors from '@hoist/errors';
import fs from 'fs';
import path from 'path';
import Boom from 'boom';
import bluebird from 'bluebird';
import config from 'config';

bluebird.promisifyAll(fs);

/**
 * Controller for user actions related their Organisations
 * @extends {BaseController}
 */
export class ConnectorController extends BaseController {
  /**
   * create a new OrganistionController
   */
  constructor() {
    super();
  }

  /**
   * get a list connectors for the current application
   * @param {HapiRequest} request - the login HTTP request
   * @param {HapiReply} reply - the reply to send to the user
   * @return {Promise}
   */
  list(request, reply) {
    return Promise
      .resolve()
      .then(() => {
        if (request.auth.credentials.application) {
          return ConnectorLogic.getConnectorsForApplication(request.auth.credentials.application)
        } else {
          return [];
        }
      })
      .then((connectors) => {
        reply(connectors);
      });
  }
  connectorBundle(request, reply) {
    return Promise
      .resolve()
      .then(() => {
        let connectorPath = path.resolve(config.get('Hoist.filePaths.connectors'), `./${request.params.connectorType}/current`)
        return fs.realpathAsync(connectorPath)
      })
      .then((connectorPath) => {
        let bundlePath = path.resolve(connectorPath, `./lib/views/${request.params.bundle}.js`);
        if (fs.existsSync(bundlePath)) {
          let response = reply.file(bundlePath);
          response.type('application/javascript');
        } else {
          reply(Boom.notFound());
        }
      });
  }
  connect(request, reply) {
    return Promise
      .resolve()
      .then(() => {
        return ConnectorLogic.setupDefaultConnector(request.auth.credentials.application, request.payload.connectorType);
      })
      .then((connector) => {
        return ConnectorLogic.getAuthUrl(connector,request.auth.credentials.organisation.slug,request.auth.credentials.application.slug);
      })
      .then((uri) => {
        reply({
          uri
        });
      })
  }

  /**
   * @override
   * @returns {Array<Object>} - an array of route configurations @see http://hapijs.com/api#route-configuration
   */
  routes() {
    return [
      {
        method: ['GET'],
        path: '/connectors',
        config: {
          handler: this.list,
          auth: {
            strategy: 'session'
          }
        }
      }, {
        method: ['GET'],
        path: '/connector/bundle/{connectorType}/{bundle}',
        config: {
          handler: this.connectorBundle,
          auth: {
            strategy: 'session'
          }
        }
      }, {
        method: ['POST'],
        path: '/connector/connect',
        config: {
          handler: this.connect,
          auth: {
            strategy: 'session'
          }
        }
      }
    ]
  }
}
export default ConnectorController;
