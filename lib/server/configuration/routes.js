'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RouteConfigurator = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _base_configurator = require('./base_configurator');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _base_controller = require('../areas/base_controller');

var _config = require('config');

var _config2 = _interopRequireDefault(_config);

var _boom = require('boom');

var _boom2 = _interopRequireDefault(_boom);

var _model = require('@hoist/model');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var globAsync = _bluebird2.default.promisify(_glob2.default);
/* istanbul ignore next */

var RouteConfigurator = exports.RouteConfigurator = function (_BaseConfigurator) {
  _inherits(RouteConfigurator, _BaseConfigurator);

  function RouteConfigurator() {
    _classCallCheck(this, RouteConfigurator);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(RouteConfigurator).call(this));
  }

  _createClass(RouteConfigurator, [{
    key: 'configure',
    value: function configure(hapiServer) {
      var _this2 = this;

      return this.mapControllerRoutes(hapiServer).then(function () {
        return _this2.mapStaticRoutes(hapiServer);
      }).then(function () {
        return _this2.mapDefaultRoute(hapiServer);
      });
    }
  }, {
    key: 'mapStaticRoutes',
    value: function mapStaticRoutes(hapiServer) {
      return hapiServer.route([{
        method: 'GET',
        path: '/js/{param*}',
        handler: {
          directory: {
            path: _path2.default.resolve(process.cwd(), './lib/client'),
            redirectToSlash: true,
            index: false
          }
        }
      }, {
        method: 'GET',
        path: '/img/{param*}',
        handler: {
          directory: {
            path: _path2.default.resolve(process.cwd(), './lib/assets/img'),
            redirectToSlash: true,
            index: false
          }
        }
      }]);
    }
  }, {
    key: 'mapDefaultRoute',
    value: function mapDefaultRoute(hapiServer) {
      var _this3 = this;

      return hapiServer.route([{
        method: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        path: '/api/{p*}',
        config: {
          handler: function handler(request, reply) {
            reply(_boom2.default.notFound());
          }
        }
      }, {
        method: 'GET',
        path: '/{p*}',
        config: {
          auth: {
            mode: 'try',
            strategy: 'session'
          },
          plugins: {
            'hapi-auth-cookie': {
              redirectTo: false
            }
          },
          handler: function handler(request, reply) {
            return Promise.resolve().then(function () {
              //should load session here
              return {};
            }).then(function (state) {
              return state;
            }).then(function (state) {
              var settings = {
                domains: _config2.default.get('Hoist.domains')
              };
              reply.view('index', {
                HoistConfig: _config2.default.get('Hoist'),
                initialState: Object.assign({}, state, {
                  session: {
                    isValid: request.auth.isAuthenticated && !!request.auth.credentials
                  }
                }, { settings: settings })
              });
            }).catch(function (err) {
              _this3._logger.alert(err);
              _this3._logger.error(err);
              reply(_boom2.default.wrap(err));
            });
          }
        }
      }]);
    }
  }, {
    key: 'mapControllerRoutes',
    value: function mapControllerRoutes(hapiServer) {
      return globAsync('../areas/**/*_controller.js', { cwd: __dirname }).then(function (controllersPaths) {
        return controllersPaths.filter(function (controllerPath) {
          return !controllerPath.endsWith('base_controller.js');
        }).map(function (controllerPath) {
          var Controller = require(controllerPath).default;
          return new Controller();
        });
      }).then(function (controllers) {
        return Promise.all(controllers.filter(function (controller) {
          return controller instanceof _base_controller.BaseController;
        }).map(function (controller) {
          return controller._loadRoutes(hapiServer);
        })).then(function () {});
      });
    }
  }]);

  return RouteConfigurator;
}(_base_configurator.BaseConfigurator);
//# sourceMappingURL=../../maps/server/configuration/routes.js.map
