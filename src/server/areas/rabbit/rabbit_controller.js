import Consul from 'consul';
import Rabbit from 'rabbitmq-stats';
import rp from 'request-promise';
import config from 'config';
import Boom from 'boom';
import url from 'url';

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
    let _r = url.parse(config.get('Hoist.rabbit.managementUrl'));
    var _auth = _r.auth.split(':');
    let rabbit = Rabbit(_r.protocol + '//' + _r.host, _auth[0], _auth[1]);
    return Promise.resolve()
      .then((ov) => {
        return rabbit.getQueues();
      })
      .then((queues) => {
        reply(queues);
      });

  }
  getStats(request, reply) {
    let _r = url.parse(config.get('Hoist.rabbit.managementUrl'));
    var _auth = _r.auth.split(':');
    return Promise.resolve()
      .then(() => {
        var options = {
          url: _r.protocol + '//' + _r.host + '/api/overview?lengths_age=60&lengths_incr=5',
          json: true,
          method: 'GET',
          auth: {
              user: _auth[0],
              pass: _auth[1],
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
