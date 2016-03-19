'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BaseController = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _model = require('@hoist/model');

var _errors = require('@hoist/errors');

var _errors2 = _interopRequireDefault(_errors);

var _logger = require('@hoist/logger');

var _logger2 = _interopRequireDefault(_logger);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _boom = require('boom');

var _boom2 = _interopRequireDefault(_boom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * a base interface for controller classes
 */
/* istanbul ignore next */

var BaseController = exports.BaseController = function () {
  /**
   * create a new BaseController
   */

  function BaseController() {
    _classCallCheck(this, BaseController);

    this._logger = _logger2.default.child({ cls: this.constructor.name });
  }

  /**
   * load all routes exposed by this controller, with default configurations
   */


  _createClass(BaseController, [{
    key: '_loadRoutes',
    value: function _loadRoutes(hapiServer) {
      var _this = this;

      return Promise.resolve().then(function () {
        _this._logger.info('setting up routes for controller');
        return _this.routes();
      }).then(function (routes) {
        return routes || [];
      }).then(function (routes) {
        _this._logger.debug({
          routes: routes.length
        }, 'mapping routes');
        return routes.map(function (route) {
          return _this._ensureRouteValid(route);
        });
      }).then(function (routes) {
        _this._logger.debug('sending routes to server');
        return hapiServer.route(routes);
      });
    }

    /**
     * ensure the route has all the defaults set up correctly
     */

  }, {
    key: '_ensureRouteValid',
    value: function _ensureRouteValid(routeObject) {
      var _this2 = this;

      //ensure we have a config object
      routeObject.config = routeObject.config || {};
      if (routeObject.handler) {
        this._logger.debug('moving handler to config object');
        routeObject.config.handler = routeObject.handler;
        delete routeObject.handler;
      }
      if (routeObject.config.handler) {
        (function () {
          var handler = routeObject.config.handler.bind(_this2);
          routeObject.config.handler = function (req, reply) {
            return Promise.resolve().then(function () {
              return handler(req, reply);
            }).catch(function (err) {
              _this2._onRequestError(req, reply, err);
            }).catch(function (err) {
              _this2._logger.alert(err);
              _this2._logger.error(err);
            });
          };
        })();
      }
      //ensure we have an auth setup
      if (routeObject.config.auth === undefined || routeObject.config.auth === null) {
        this._logger.debug('adding auth to route');
        routeObject.config.auth = {
          strategy: 'session'
        };
      }
      if (!routeObject.path.startsWith('/api')) {
        this._logger.debug('setting api path');
        routeObject.path = _path2.default.join('/api', routeObject.path);
      }
      return routeObject;
    }

    /**
     * expose routes for the controller
     * @abstract
     * @returns {Array<Object>} - an array of route configurations @see http://hapijs.com/api#route-configuration
     */

  }, {
    key: 'routes',
    value: function routes() {
      this._logger.error('controller should redefine the #routes methods');
      throw new Error("controllers should override #routes");
    }

    /**
     * this is a generic controller error handler, you shouldn't really get here but is a catch if exception handling hasn't been done
     */

  }, {
    key: '_onRequestError',
    value: function _onRequestError(request, reply, error) {
      this._logger.error(error);
      if (error instanceof _model._mongoose.Error) {
        if (error instanceof _model._mongoose.Error.ValidationError) {
          var boom = _boom2.default.badRequest(error.message);
          boom.output.payload.errors = error.errors;
          error = boom;
        }
      }
      if (error.isBoom) {
        return reply(error);
      } else if (!_errors2.default.isHoistError(error)) {
        error = new _errors2.default.HoistError();
      }
      reply(_boom2.default.wrap(error, error.code || 500));
    }
  }]);

  return BaseController;
}();

/**
 * @external {HapiRequest} http://hapijs.com/api#request-object
 * @external {HapiReply} http://hapijs.com/api#reply-interface
 */
//# sourceMappingURL=../../maps/server/areas/base_controller.js.map
