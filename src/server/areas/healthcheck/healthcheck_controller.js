import {BaseController} from '../base_controller';
import {_mongoose} from '@hoist/model';
/**
 * Controller for actions related to healthchecks
 * @extends {BaseController}
 */
export class HealthcheckController extends BaseController {
  /**
   * create a new HealthcheckController
   */
  constructor () {
    super();
  }

  /**
   * simple heartbeat that returns 200 if server and db connection are up and running
   * @param {HapiRequest} request - the login HTTP request
   * @param {HapiReply} reply - the reply to send to the user
   * @return {Promise}
   */
  healthcheck (request, reply) {
    return new Promise(function (resolve) {
      var ok = true;
      var result = {};
      if (_mongoose.connection.readyState !== 1) {
        result.db = 'fail';
        ok = false;
      } else {
        result.db = 'pass';
      }
      if (ok) {
        reply(result);
      } else {
        var response = reply(result);
        response.statusCode = 500;
      }
      resolve();
    });
  }

  /**
   * @override
   * @returns {Array<Object>} - an array of route configurations @see http://hapijs.com/api#route-configuration
   */
  routes () {
    return [
      {
        method: ['GET'],
        path: '/healthcheck',
        config: {
          handler: this.healthcheck,
          auth: false
        }
      }
    ]
  }
}
export default HealthcheckController;
