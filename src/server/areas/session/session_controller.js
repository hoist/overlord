import {BaseController} from '../base_controller';
import errors from '@hoist/errors';
import {SessionLogic} from '../../logic';

/**
 * Controller for user actions related their current session
 * @extends {BaseController}
 */
export class SessionController extends BaseController {
  /**
   * create a new SessionController
   */
  constructor () {
    super();
  }

  /**
   * create a new session for the user, sign them out of any existing session on post
   * The following happens in this request
   * 1) the IP address of the request is checked to ensure it isn't locked (through too many successive incorrect login attempts)
   * 2) the parameters supplied are checked for validity
   * 3) the user with a matching email address is found
   * 4) the user is checked for lock based on login attempts against username
   * 5) the password is checked
   * 6) the last user session is loaded
   * 7) the current org and application are set from last session
   * 8) the list of users organisations and applications are loaded
   * 9) the session is created and saved
   * 10) a response is sent to the user
   * 11) a login log and ip log entry are created and saved
   * On failure of any of the above steps
   * 1) a login log and ip log entry are saved
   * 2) an error response is sent to the user
   * @param {HapiRequest} request - the login HTTP request
   * @param {HapiReply} reply - the reply to send to the user
   * @return {Promise}
   */
  create (request, reply) {
    let ipAddress = request.headers['x-real-ip']
      ? request.headers['x-real-ip']
      : request.info.remoteAddress;
    let payload = request.payload || {};
    let email = payload.email;
    let password = payload.password;
    return Promise
      .resolve()
      .then(() => SessionLogic.ensureLogin({email, password, ipAddress}))
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
        }, false).then(() => {
          return this._onRequestError(request, reply, err);
        });
      });
  }

  /**
   * destroy any existing session for the user
   * @param {HapiRequest} request - the login HTTP request
   * @param {HapiReply} reply - the reply to send to the user
   * @return {Promise}
   */
  destroy (request, reply) {
    return Promise
      .resolve()
      .then(() => {
        if (request.auth.isAuthenticated) {
          request
            .cookieAuth
            .clear();
        }
        reply({ok: true});
      });
  }

  /**
   * get current session details
   * @param {HapiRequest} request - the login HTTP request
   * @param {HapiReply} reply - the reply to send to the user
   * @return {Promise}
   */
  current (request, reply) {
    return Promise
      .resolve()
      .then(() => {
        if (request.auth.isAuthenticated) {
          return SessionLogic
            .getSessionDetails(request.auth.credentials)
            .then(sessionDetails => reply(sessionDetails));
        } else {
          throw new errors.Http401Error();
        }
      })
      .catch((err) => {
        return this._onRequestError(err);
      });
  }

  /**
   * updates the current organisation on the session and saves the session changes
   * @param {HapiRequest} request - the login HTTP request
   * @param {HapiReply} reply - the reply to send to the user
   * @return {Promise}
   */
  updateOrganisation (request, reply) {
    return Promise
      .resolve()
      .then(() => {
        return SessionLogic.updateOrganisation(request.auth.credentials, request.payload._id);
      })
      .then((sessionDetails) => {
        reply(sessionDetails);
      });
  }

  /**
   * updates the current organisation on the session and saves the session changes
   * @param {HapiRequest} request - the login HTTP request
   * @param {HapiReply} reply - the reply to send to the user
   * @return {Promise}
   */
  updateApplication (request, reply) {
    return Promise
      .resolve()
      .then(() => {
        return SessionLogic.updateApplication(request.auth.credentials, request.payload._id);
      })
      .then((sessionDetails) => {
        reply(sessionDetails);
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
        path: '/session',
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
        path: '/session/organisation',
        config: {
          handler: this.updateOrganisation,
          auth: {
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
        path: '/session/application',
        config: {
          handler: this.updateApplication,
          auth: {
            strategy: 'session'
          },
          plugins: {
            'hapi-auth-cookie': {
              redirectTo: false
            }
          }
        }
      }, {
        method: 'DELETE',
        path: '/session',
        config: {
          handler: this.destroy,
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
      }, {
        method: 'GET',
        path: '/session',
        config: {
          handler: this.current,
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
export default SessionController;
