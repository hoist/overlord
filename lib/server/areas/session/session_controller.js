'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SessionController = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _base_controller = require('../base_controller');

var _errors = require('@hoist/errors');

var _errors2 = _interopRequireDefault(_errors);

var _logic = require('../../logic');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Controller for user actions related their current session
 * @extends {BaseController}
 */

var SessionController = exports.SessionController = function (_BaseController) {
  _inherits(SessionController, _BaseController);

  /**
   * create a new SessionController
   */

  function SessionController() {
    _classCallCheck(this, SessionController);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(SessionController).call(this));
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


  _createClass(SessionController, [{
    key: 'create',
    value: function create(request, reply) {
      var _this2 = this;

      var ipAddress = request.headers['x-real-ip'] ? request.headers['x-real-ip'] : request.info.remoteAddress;
      var payload = request.payload || {};
      var email = payload.email;
      var password = payload.password;
      return Promise.resolve().then(function () {
        return _logic.SessionLogic.ensureLogin({ email: email, password: password, ipAddress: ipAddress });
      }).then(function (user) {
        return _logic.SessionLogic.createSessionForUser(user);
      }).then(function (session) {
        //set the current user session
        request.cookieAuth.set(session);
        return _logic.SessionLogic.getSessionDetails(session);
      }).then(function (sessionDetails) {
        return reply(sessionDetails);
      }).then(function () {
        return _logic.SessionLogic.logLogin({
          email: email,
          password: password,
          ipAddress: ipAddress
        }, true);
      }).catch(function (err) {
        return _logic.SessionLogic.logLogin({
          email: email,
          password: password,
          ipAddress: ipAddress
        }, false).then(function () {
          return _this2._onRequestError(request, reply, err);
        });
      });
    }

    /**
     * destroy any existing session for the user
     * @param {HapiRequest} request - the login HTTP request
     * @param {HapiReply} reply - the reply to send to the user
     * @return {Promise}
     */

  }, {
    key: 'destroy',
    value: function destroy(request, reply) {
      return Promise.resolve().then(function () {
        if (request.auth.isAuthenticated) {
          request.cookieAuth.clear();
        }
        reply({ ok: true });
      });
    }

    /**
     * get current session details
     * @param {HapiRequest} request - the login HTTP request
     * @param {HapiReply} reply - the reply to send to the user
     * @return {Promise}
     */

  }, {
    key: 'current',
    value: function current(request, reply) {
      var _this3 = this;

      return Promise.resolve().then(function () {
        if (request.auth.isAuthenticated) {
          return _logic.SessionLogic.getSessionDetails(request.auth.credentials).then(function (sessionDetails) {
            return reply(sessionDetails);
          });
        } else {
          throw new _errors2.default.Http401Error();
        }
      }).catch(function (err) {
        return _this3._onRequestError(err);
      });
    }

    /**
     * updates the current organisation on the session and saves the session changes
     * @param {HapiRequest} request - the login HTTP request
     * @param {HapiReply} reply - the reply to send to the user
     * @return {Promise}
     */

  }, {
    key: 'updateOrganisation',
    value: function updateOrganisation(request, reply) {
      return Promise.resolve().then(function () {
        return _logic.SessionLogic.updateOrganisation(request.auth.credentials, request.payload._id);
      }).then(function (sessionDetails) {
        reply(sessionDetails);
      });
    }

    /**
     * updates the current organisation on the session and saves the session changes
     * @param {HapiRequest} request - the login HTTP request
     * @param {HapiReply} reply - the reply to send to the user
     * @return {Promise}
     */

  }, {
    key: 'updateApplication',
    value: function updateApplication(request, reply) {
      return Promise.resolve().then(function () {
        return _logic.SessionLogic.updateApplication(request.auth.credentials, request.payload._id);
      }).then(function (sessionDetails) {
        reply(sessionDetails);
      });
    }

    /**
     * @override
     * @returns {Array<Object>} - an array of route configurations @see http://hapijs.com/api#route-configuration
     */

  }, {
    key: 'routes',
    value: function routes() {
      return [{
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
      }];
    }
  }]);

  return SessionController;
}(_base_controller.BaseController);

exports.default = SessionController;
//# sourceMappingURL=../../../maps/server/areas/session/session_controller.js.map
