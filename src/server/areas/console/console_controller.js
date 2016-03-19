import {
  BaseController
} from '../base_controller';
import {
  ConsoleLogic
} from '../../logic';
import uuid from 'uuid';
import errors from '@hoist/errors';
/**
 * Controller for actions related to the developer console
 * @extends {BaseController}
 */
export class ConsoleController extends BaseController {
  /**
   * create a new ConsoleController
   */
  constructor() {
    super();
  }

  /**
   * gets state data to populate the editor
   * @param {HapiRequest} request - the login HTTP request
   * @param {HapiReply} reply - the reply to send to the user
   * @return {Promise}
   */
  get(request, reply) {
    if (process.env.TEST_CONSOLE) {
      return Promise
        .resolve()
        .then(() => {
          reply({
            "messages": [
              {
                "id": "5dff5df9b09054439c95feda720a084d27b6a71f",
                "type": "DEPLOY",
                "message": "mDeploy complete. Hash: 5dff5df9b09054439c95feda720a084d27b6a71f",
                "time": "01:17:02",
                "stack": []
              }, {
                "id": "56e21c8c39838a18008c5663",
                "type": "MDL",
                "message": "module pingLog starting (from event id: c43ae06b70464895b8a8e5174c659863)",
                "time": "01:17:02",
                "stack": []
              }, {
              //   "id": "56e21c8c39838a18008c5664",
              //   "type": "LOG",
              //   "message": "[\"got a ping\",{\"eventId\":\"c43ae06b70464895b8a8e5174c659863\",\"applicationId\":\"demo-connect-app\",\"eventName\":\"ping:me\",\"environment\":\"live\",\"correlationId\":\"582daa27-e1bc-4ce7-8b79-16a925ec14c7\",\"_id\":\"56e21c8c40cd5339004a39e3\"}]",
              //   "time": "01:17:02",
              //   "stack": []
              // }, {
                "id": "56e21c8c40cd5339004a39e7",
                "type": "EVT",
                "message": "event ping:me raised (id: c43ae06b70464895b8a8e5174c659863)",
                "time": "01:17:02",
                "stack": []
              }, {
                "id": "56e21c8c39838a18008c5665",
                "type": "MDL",
                "message": "module pingLog completed in 8.023706ms (from event id: c43ae06b70464895b8a8e5174c659863)",
                "time": "01:17:02",
                "stack": []
              }, {
                "id": "56e21c8c39838a18008c5666",
                "type": "EVT",
                "message": "event ping:me complete (id: c43ae06b70464895b8a8e5174c659863)",
                "time": "01:17:02",
                "stack": []
              }
            ],
            "continuationToken": "b2ef3173-c459-4fb1-9e1f-c20a6e688368"
          });
        });
    }
    return Promise
      .resolve()
      .then(() => {
        return request.query.continuationToken || uuid.v4();
      })
      .then((continuationToken) => {
        return ConsoleLogic
          .getMessages(request.auth.credentials.application, continuationToken)
          .then((messages) => {
            this
              ._logger
              .info({
                messages
              }, 'reply from rabbit');
            reply({
              messages: messages,
              continuationToken
            })
          });
      });

  }

  /**
   * @override
   * @returns {Array<Object>} - an array of route configurations @see http://hapijs.com/api#route-configuration
   */
  routes() {
    return [
      {
        method: 'GET',
        path: '/console',
        config: {
          handler: this.get,
          auth: {
            strategy: 'session'
          },
          plugins: {
            'hapi-auth-cookie': {
              redirectTo: false
            }
          }
        }
      }
    ]
  }
}
export default ConsoleController;
