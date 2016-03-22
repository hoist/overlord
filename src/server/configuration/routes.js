'use strict';
import {BaseConfigurator} from './base_configurator';
import path from 'path';
import glob from 'glob';
import Bluebird from 'bluebird';
import {BaseController} from '../areas/base_controller';
import config from 'config';
import Boom from 'boom';
import {Session} from '@hoist/model';
let globAsync = Bluebird.promisify(glob);
/* istanbul ignore next */
export class RouteConfigurator extends BaseConfigurator {
  constructor() {
    super();
  }
  configure(hapiServer) {
    return this
      .mapControllerRoutes(hapiServer)
      .then(() => this.mapStaticRoutes(hapiServer))
      .then(() => this.mapDefaultRoute(hapiServer));
  }
  mapStaticRoutes(hapiServer) {
    return hapiServer.route([
      {
        method: 'GET',
        path: '/js/{param*}',
        handler: {
          directory: {
            path: path.resolve(process.cwd(), './lib/client'),
            redirectToSlash: true,
            index: false
          }
        }
      }, {
        method: 'GET',
        path: '/img/{param*}',
        handler: {
          directory: {
            path: path.resolve(process.cwd(), './lib/assets/img'),
            redirectToSlash: true,
            index: false
          }
        }
      }
    ]);
  }
  mapDefaultRoute(hapiServer) {
    return hapiServer.route([
      {
        method: [
          'GET', 'POST', 'PUT', 'PATCH', 'DELETE'
        ],
        path: '/api/{p*}',
        config: {
          handler: (request, reply) => {
            reply(Boom.notFound())
          }
        }
      }, {
        method: 'GET',
        path: '/{p*}',
        config: {
          auth: {
            mode: 'try',
            strategy: 'session'
          },
          plugins: {
            'hapi-auth-cookie': {
              redirectTo: false
            }
          },
          handler: (request, reply) => {
            return Promise
              .resolve()
              .then(() => {
                //should load session here
                return {};
              })
              .then((state) => {
                return state;
              })
              .then((state) => {
                reply.view('index', {
                  HoistConfig: config.get('Hoist'),
                  initialState: Object.assign({}, state, {

                  }, {})
                });
              })
              .catch((err) => {
                this
                  ._logger
                  .alert(err);
                this
                  ._logger
                  .error(err);
                reply(Boom.wrap(err));
              });
          }
        }
      }
    ])
  }
  mapControllerRoutes(hapiServer) {
    return globAsync('../areas/**/*_controller.js', {cwd: __dirname}).then((controllersPaths) => {
      return controllersPaths.filter((controllerPath) => {
        return !controllerPath.endsWith('base_controller.js');
      }).map((controllerPath) => {
        let Controller = require(controllerPath).default;
        return new Controller();
      });
    }).then((controllers) => {
      return Promise.all(controllers.filter((controller) => {
        return (controller instanceof BaseController);
      }).map((controller) => {
        return controller._loadRoutes(hapiServer);
      })).then(() => {});
    });

  }
}
