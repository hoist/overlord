import Fleet from 'node-fleet-api';
import config from 'config';
import Boom from 'boom';

import {
  BaseController
} from '../base_controller';
/**
 * Controller for Fleet related actions
 * @extends {BaseController}
 */
export class FleetController extends BaseController {
  /**
   * create a new FleetController
   */
  constructor() {
    super();
  }

  getStatus(request, reply) {
    if(!config.has('Hoist.fleet.host')) {
        reply(Boom.preconditionFailed("Fleet config missing"));
        return;
    }
    let fleet = Fleet("http://" + config.get('Hoist.fleet.host') + ":" + config.get('Hoist.fleet.port'));
    return Promise.resolve()
      .then(() => {
        return new Promise(function(resolve) {
          fleet.getAllUnits(function(error, results) {
            resolve(results.units);
          });
        });
      })
      .then((results) => {
        reply(results);
      });

  }

  /**
   * @override
   * @returns {Array<Object>} - an array of route configurations @see http://hapijs.com/api#route-configuration
   */
  routes() {
    return [{
      method: ['GET'],
      path: '/fleet/status',
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
export default FleetController;
