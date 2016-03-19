import {BaseController} from '../base_controller';
import {ConnectorLogic, EditorLogic, EventLogic} from '../../logic';
/*
 * Controller for user actions related events
 * @extends {BaseController}
 */
export class EventController extends BaseController {
  /**
   * create a new OrganistionController
   */
  constructor () {
    super();
  }
  /**
  *
  */
  create (request, reply) {
    return Promise
      .resolve()
      .then(() => {
        return EventLogic.createEvent(request.auth.credentials.application, request.payload.eventName);
      })
      .then((eventName) => {
        return {name: eventName, description: '', key: eventName}
      })
      .then((event) => {
        reply(event);
      });
  }
  /**
   * @override
   * @returns {Array<Object>} - an array of route configurations @see http://hapijs.com/api#route-configuration
   */
  routes () {
    return [
      {
        method: 'POST',
        path: '/event',
        config: {
          handler: this.create,
          auth: {
            strategy: 'session'
          }
        }
      }
    ]
  }
}
export default EventController;
