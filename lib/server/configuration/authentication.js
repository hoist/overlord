'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AuthenticationConfigurator = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _base_configurator = require('./base_configurator');

var _config = require('config');

var _config2 = _interopRequireDefault(_config);

var _hapiAuthCookie = require('hapi-auth-cookie');

var _hapiAuthCookie2 = _interopRequireDefault(_hapiAuthCookie);

var _model = require('@hoist/model');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/* istanbul ignore next */

var AuthenticationConfigurator = exports.AuthenticationConfigurator = function (_BaseConfigurator) {
  _inherits(AuthenticationConfigurator, _BaseConfigurator);

  function AuthenticationConfigurator() {
    _classCallCheck(this, AuthenticationConfigurator);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(AuthenticationConfigurator).apply(this, arguments));
  }

  _createClass(AuthenticationConfigurator, [{
    key: 'configure',
    value: function configure(hapiServer) {
      return Promise.resolve().then(function () {
        return hapiServer.registerAsync(_hapiAuthCookie2.default);
      }).then(function () {
        return hapiServer.auth.strategy('session', 'cookie', {
          password: _config2.default.get('Hoist.cookies.beta.password'),
          cookie: _config2.default.get('Hoist.cookies.beta.name'),
          redirectTo: '/session/create',
          isSecure: _config2.default.get('Hoist.cookies.beta.secure'),
          validateFunc: function validateFunc(request, session, callback) {
            return Promise.resolve(_model.Session.findOne({ _id: session._id, isValid: true }).populate({ path: 'organisation' }).populate({ path: 'user' }).populate({ path: 'application' }).exec()).then(function (loadedSession) {
              callback(null, !!loadedSession, loadedSession);
            }).catch(function (err) {
              callback(err);
            });
          }
        });
      });
    }
  }]);

  return AuthenticationConfigurator;
}(_base_configurator.BaseConfigurator);
//# sourceMappingURL=../../maps/server/configuration/authentication.js.map
