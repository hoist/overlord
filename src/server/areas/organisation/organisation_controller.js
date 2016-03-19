import {BaseController} from '../base_controller';
import {Organisation, HoistUser, Session} from '@hoist/model';
import errors from '@hoist/errors';
import {StringUtils} from '../../utils';
/**
 * Controller for user actions related their Organisations
 * @extends {BaseController}
 */
export class OrganisationController extends BaseController {
  /**
   * create a new OrganistionController
   */
  constructor () {
    super();
  }
  _createSlugFromName (name, postfix = '') {
    name = StringUtils.sanitiseName(name);
    return Organisation
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
   * create a Organisation
   * @param {HapiRequest} request - the login HTTP request
   * @param {HapiReply} reply - the reply to send to the user
   * @return {Promise}
   */
  create (request, reply) {
    return Promise
      .resolve()
      .then(() => {
        if (!request.payload.name || request.payload.name.length < 1) {
          throw new errors.Http400Error('Organisation Name must be supplied');
        }
      })
      .then(() => {
        return this
          ._createSlugFromName(request.payload.name)
          .then((slug) => {
            return {name: request.payload.name, slug}
          });
      })
      .then(organisationDetails => {
        return new Organisation(organisationDetails).saveAsync();
      })
      .then((organisation) => {
        if (organisation.length) {
          organisation = organisation[0];
        }
        return HoistUser.updateAsync({
          _id: request.auth.credentials.user._id
        }, {
          $push: {
            organisations: organisation._id
          }
        }).then(() => {
          return {_id: organisation._id, slug: organisation.slug, name: organisation.name, isPersonal: organisation.isPersonal};
        });
      })
      .then((organisation) => {
        reply(organisation).code(201);
        return Session.updateAsync({
          _id: request.auth.credentials._id
        }, {
          $set: {
            organisation: organisation._id
          }
        });
      });
  }

  /**
   * returns the organisation details represented by the slug of the request
   * @param {HapiRequest} request - the login HTTP request
   * @param {HapiReply} reply - the reply to send to the user
   * @return {Promise}
   */
  fetch (request, reply) {
    return Promise
      .resolve()
      .then(() => {
        return Organisation.findOneAsync({
          _id: {
            $in: request.auth.credentials.user.organisations
          },
          slug: request.params.slug
        });
      })
      .then((organisation) => {
        if (!organisation) {
          throw new errors.Http404Error('Organisation could not be found');
        } else {
          reply(organisation);
        }
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
        path: '/organisation',
        config: {
          handler: this.create,
          auth: {
            strategy: 'session'
          }
        }
      }, {
        method: ['GET'],
        path: '/organisation/{slug}',
        config: {
          handler: this.fetch,
          auth: {
            strategy: 'session'
          }
        }
      }
    ]
  }
}
export default OrganisationController;
