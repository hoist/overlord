import {
  BaseController
} from '../base_controller';
import errors from '@hoist/errors';
import {
  UserLogic,
  SessionLogic
} from '../../logic';

/**
 * Controller for actions related to users
 * @extends {BaseController}
 */
export class UserController extends BaseController {
  /**
   * create a new UserController
   */
  constructor() {
    super();
  }

  /**
   * create a new User and sign the user in
   * @param {HapiRequest} request - the login HTTP request
   * @param {HapiReply} reply - the reply to send to the user
   * @return {Promise}
   */
  create(request, reply) {
    let ipAddress = request.headers['x-real-ip'] ? request.headers['x-real-ip'] : request.info.remoteAddress;
    let payload = request.payload || {};
    let email = payload.email;
    let username = payload.username;
    let password = payload.password;
    let passwordCheck = payload['password-repeat'];
    return Promise
      .resolve()
      .then(() => UserLogic.create({
        username,
        email,
        password,
        passwordCheck
      }))
      .then((user) => SessionLogic.createSessionForUser(user))
      .then((session) => {
        //set the current user session
        request
          .cookieAuth
          .set(session);
        return SessionLogic.getSessionDetails(session);
      })
      .then((sessionDetails) => reply(sessionDetails))
      .then(() => {
        return SessionLogic.logLogin({
          email,
          password,
          ipAddress
        }, true);
      })
      .catch((err) => {
        return SessionLogic.logLogin({
            email,
            password,
            ipAddress
          }, false)
          .then(() => {
            return this._onRequestError(request, reply, err);
          });
      });
  }

  /**
   * create a new Forgotten Password request
   * @param {HapiRequest} request - the login HTTP request
   * @param {HapiReply} reply - the reply to send to the user
   * @return {Promise}
   */
  generateForgottenPassword(request, reply) {
    return Promise.resolve()
      .then(() => {
        let email = request.payload.email;
        return UserLogic.createForgottenPassword({
          email
        });
      })
      .then(() => {
        reply({
          ok: true
        });
      });
  }

  /**
   * resets a user password linked to a forgotten password request
   * @param {HapiRequest} request - the login HTTP request
   * @param {HapiReply} reply - the reply to send to the user
   * @return {Promise}
   */
  activateForgottenPassword(request, reply) {
    return Promise.resolve()
      .then(() => {
        let password = request.payload.password;
        let passwordCheck = request.payload['password-repeat'];
        let activationCode = request.params.activationCode;
        return UserLogic.activateForgottenPassword({
          password,
          passwordCheck,
          activationCode
        });
      })
      .then(() => {
        reply({
          ok: true
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
        method: 'POST',
        path: '/user',
        config: {
          handler: this.create,
          auth: {
            mode: 'try',
            strategy: 'session'
          },
          plugins: {
            'hapi-auth-cookie': {
              redirectTo: false
            }
          }
        }
      }, {
        method: 'POST',
        path: '/user/forgot-password',
        config: {
          handler: this.generateForgottenPassword,
          auth: {
            mode: 'try',
            strategy: 'session'
          },
          plugins: {
            'hapi-auth-cookie': {
              redirectTo: false
            }
          }
        }
      },
      {
        method: 'POST',
        path: '/user/forgot-password/{activationCode}',
        config: {
          handler: this.activateForgottenPassword,
          auth: {
            mode: 'try',
            strategy: 'session'
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
export
default UserController;
