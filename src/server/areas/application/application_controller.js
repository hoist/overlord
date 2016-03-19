import {BaseController} from '../base_controller';
import {Organisation, HoistUser, Application, Session} from '@hoist/model';
import errors from '@hoist/errors';
import {StringUtils} from '../../utils';
/**
 * Controller for user actions related their Applications
 * @extends {BaseController}
 */
export class ApplicationController extends BaseController {
  /**
   * create a new OrganistionController
   */
  constructor () {
    super();
  }
  _createSlugFromName (name, postfix = '') {
    name = StringUtils.sanitiseName(name);
    return Application
      .countAsync({
      slug: name + postfix
    })
      .then((count) => {
        if (count > 0) {
          //colision so add number
          return this._createSlugFromName(name, Math.floor(Math.random() * 10000));
        }
        return name + postfix;
      });
  }

  /**
   * create a Application
   * @param {HapiRequest} request - the login HTTP request
   * @param {HapiReply} reply - the reply to send to the user
   * @return {Promise}
   */
  create (request, reply) {
    return Promise
      .resolve()
      .then(() => {
        if (!request.payload.name || request.payload.name.length < 1) {
          throw new errors.Http400Error('Application Name must be supplied');
        }
      })
      .then(() => {
        return this
          ._createSlugFromName(request.payload.name)
          .then((slug) => {
            return {organisation: request.auth.credentials.organisation, name: request.payload.name, slug}
          });
      })
      .then(applicationDetails => {
        return new Application(applicationDetails).saveAsync();
      })
      .then((application) => {
        if (application.length) {
          application = application[0];
        }
        return {_id: application._id, slug: application.slug, name: application.name};
      })
      .then((application) => {
        reply(application).code(201);
        return Session.updateAsync({
          _id: request.auth.credentials._id
        }, {
          $set: {
            application: application._id
          }
        });
      });
  }

  /**
   * @override
   * @returns {Array<Object>} - an array of route configurations @see http://hapijs.com/api#route-configuration
   */
  routes () {
    return [
      {
        method: ['POST'],
        path: '/application',
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
export default ApplicationController;
