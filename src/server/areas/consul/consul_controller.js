import Consul from 'consul';
import config from 'config';
import Boom from 'boom';

import {
  BaseController
} from '../base_controller';
/**
 * Controller for Consul related actions
 * @extends {BaseController}
 */
export class ConsulController extends BaseController {
  /**
   * create a new ConsulController
   */
  constructor() {
    super();
  }

  getStatus(request, reply) {
    if(!config.has('Hoist.consul.host')) {
        reply(Boom.preconditionFailed("Consul config missing"));
        return;
    }
    let consul = Consul({
      host: config.get('Hoist.consul.host'),
      port: config.get('Hoist.consul.port')
    });
    return Promise.resolve()
      .then(() => {
        return Promise.all([
          new Promise((resolve, reject) => {
            consul.catalog.service.list(['dc1'], function(error, result) {
              resolve(result);
            });
          }),
          new Promise((resolve, reject) => {
            consul.catalog.node.list(['dc1'], function(error, result) {
              resolve(result);
            });
          })
        ]);
      })
      .then((results) => {
        let response = {
          services: Object.keys(results[0]).map((k) => {
            return {name: k, tags: results[0][k]};
          }),
          nodes: results[1]
        };
        reply(response);
      });

  }

  /**
   * @override
   * @returns {Array<Object>} - an array of route configurations @see http://hapijs.com/api#route-configuration
   */
  routes() {
    return [{
      method: ['GET'],
      path: '/consul/status',
      config: {
        handler: this.getStatus,
        auth: {
          strategy: 'session',
          mode: 'try'
        },
        plugins: {
          'hapi-auth-cookie': {
            redirectTo: false
          }
        }
      }
    }]
  }
}
export default ConsulController;
