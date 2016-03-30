import Consul from 'consul';
import Rabbit from 'rabbitmq-stats';
import rp from 'request-promise';
import config from 'config';
import Boom from 'boom';

let dummyData = [{
  name: 'queue1'
}];

import {
  BaseController
} from '../base_controller';
/**
 * Controller for Consul related actions
 * @extends {BaseController}
 */
export class RabbitController extends BaseController {
  /**
   * create a new ConsulController
   */
  constructor() {
    super();
  }

  getStatus(request, reply) {
    if(!config.has('Hoist.rabbit.url')) {
        reply(Boom.preconditionFailed("Rabbit config missing"));
        return;
    }
    let rabbit = Rabbit(config.get('Hoist.rabbit.url'), config.get('Hoist.rabbit.username'), config.get('Hoist.rabbit.password'));
    return Promise.resolve()
      .then((ov) => {
        return rabbit.getQueues();
      })
      .then((queues) => {
        reply(queues);
      });

  }
  getStats(request, reply) {
    if(!config.has('Hoist.rabbit.url')) {
        reply(Boom.preconditionFailed("Rabbit config missing"));
        return;
    }
    return Promise.resolve()
      .then(() => {
        var options = {
          url: config.get('Hoist.rabbit.url') + '/api/overview?lengths_age=60&lengths_incr=5',
          json: true,
          method: 'GET',
          auth: {
              user: config.get('Hoist.rabbit.username'),
              pass: config.get('Hoist.rabbit.password'),
              sendImmediately: false
          }
        };
        return rp(options);
      })
      .then((overview) => {
        overview.stamp = Date.now();
        reply(overview);
      });

  }

  /**
   * @override
   * @returns {Array<Object>} - an array of route configurations @see http://hapijs.com/api#route-configuration
   */
  routes() {
    return [{
      method: ['GET'],
      path: '/rabbit/status',
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
    },
    {
      method: ['GET'],
      path: '/rabbit/statistics',
      config: {
        handler: this.getStats,
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
export default RabbitController;
