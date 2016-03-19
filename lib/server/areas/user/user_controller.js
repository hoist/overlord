'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UserController = undefined;

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
 * Controller for actions related to users
 * @extends {BaseController}
 */

var UserController = exports.UserController = function (_BaseController) {
  _inherits(UserController, _BaseController);

  /**
   * create a new UserController
   */

  function UserController() {
    _classCallCheck(this, UserController);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(UserController).call(this));
  }

  /**
   * create a new User and sign the user in
   * @param {HapiRequest} request - the login HTTP request
   * @param {HapiReply} reply - the reply to send to the user
   * @return {Promise}
   */


  _createClass(UserController, [{
    key: 'create',
    value: function create(request, reply) {
      var _this2 = this;

      var ipAddress = request.headers['x-real-ip'] ? request.headers['x-real-ip'] : request.info.remoteAddress;
      var payload = request.payload || {};
      var email = payload.email;
      var username = payload.username;
      var password = payload.password;
      var passwordCheck = payload['password-repeat'];
      return Promise.resolve().then(function () {
        return _logic.UserLogic.create({
          username: username,
          email: email,
          password: password,
          passwordCheck: passwordCheck
        });
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
     * create a new Forgotten Password request
     * @param {HapiRequest} request - the login HTTP request
     * @param {HapiReply} reply - the reply to send to the user
     * @return {Promise}
     */

  }, {
    key: 'generateForgottenPassword',
    value: function generateForgottenPassword(request, reply) {
      return Promise.resolve().then(function () {
        var email = request.payload.email;
        return _logic.UserLogic.createForgottenPassword({
          email: email
        });
      }).then(function () {
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

  }, {
    key: 'activateForgottenPassword',
    value: function activateForgottenPassword(request, reply) {
      return Promise.resolve().then(function () {
        var password = request.payload.password;
        var passwordCheck = request.payload['password-repeat'];
        var activationCode = request.params.activationCode;
        return _logic.UserLogic.activateForgottenPassword({
          password: password,
          passwordCheck: passwordCheck,
          activationCode: activationCode
        });
      }).then(function () {
        reply({
          ok: true
        });
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
      }, {
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
      }];
    }
  }]);

  return UserController;
}(_base_controller.BaseController);

exports.default = UserController;
//# sourceMappingURL=../../../maps/server/areas/user/user_controller.js.map
