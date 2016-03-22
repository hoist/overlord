let dummyData = [{
  name: "beta.hoist.io@1.service",
  version: "v0.10.alpha"
}, {
  name: "beta.hoist.io@2.service",
  version: "v0.11.alpha"
}, {
  name: "executor@1.service",
  version: "v1.0.rc"
}, {
  name: "executor@2.service",
  version: "v1.0.rc"
}, {
  name: "executor@3.service",
  version: "v1.0.rc"
}, {
  name: "beta.hoist.io@1.service",
  version: "v0.10.alpha"
}, {
  name: "beta.hoist.io@2.service",
  version: "v0.11.alpha"
}, {
  name: "executor@1.service",
  version: "v1.0.rc"
}, {
  name: "executor@2.service",
  version: "v1.0.rc"
}, {
  name: "executor@3.service",
  version: "v1.0.rc"
}, {
  name: "beta.hoist.io@1.service",
  version: "v0.10.alpha"
}, {
  name: "beta.hoist.io@2.service",
  version: "v0.11.alpha"
}, {
  name: "executor@1.service",
  version: "v1.0.rc"
}, {
  name: "executor@2.service",
  version: "v1.0.rc"
}, {
  name: "executor@3.service",
  version: "v1.0.rc"
}]

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
    return Promise.resolve()
      .then(() => {
        reply(dummyData);
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
