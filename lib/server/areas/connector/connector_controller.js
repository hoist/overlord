'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ConnectorController = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _base_controller = require('../base_controller');

var _logic = require('../../logic');

var _errors = require('@hoist/errors');

var _errors2 = _interopRequireDefault(_errors);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _boom = require('boom');

var _boom2 = _interopRequireDefault(_boom);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _config = require('config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

_bluebird2.default.promisifyAll(_fs2.default);

/**
 * Controller for user actions related their Organisations
 * @extends {BaseController}
 */

var ConnectorController = exports.ConnectorController = function (_BaseController) {
  _inherits(ConnectorController, _BaseController);

  /**
   * create a new OrganistionController
   */

  function ConnectorController() {
    _classCallCheck(this, ConnectorController);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(ConnectorController).call(this));
  }

  /**
   * get a list connectors for the current application
   * @param {HapiRequest} request - the login HTTP request
   * @param {HapiReply} reply - the reply to send to the user
   * @return {Promise}
   */


  _createClass(ConnectorController, [{
    key: 'list',
    value: function list(request, reply) {
      return Promise.resolve().then(function () {
        if (request.auth.credentials.application) {
          return _logic.ConnectorLogic.getConnectorsForApplication(request.auth.credentials.application);
        } else {
          return [];
        }
      }).then(function (connectors) {
        reply(connectors);
      });
    }
  }, {
    key: 'connectorBundle',
    value: function connectorBundle(request, reply) {
      return Promise.resolve().then(function () {
        var connectorPath = _path2.default.resolve(_config2.default.get('Hoist.filePaths.connectors'), './' + request.params.connectorType + '/current');
        return _fs2.default.realpathAsync(connectorPath);
      }).then(function (connectorPath) {
        var bundlePath = _path2.default.resolve(connectorPath, './lib/views/' + request.params.bundle + '.js');
        if (_fs2.default.existsSync(bundlePath)) {
          var response = reply.file(bundlePath);
          response.type('application/javascript');
        } else {
          reply(_boom2.default.notFound());
        }
      });
    }
  }, {
    key: 'connect',
    value: function connect(request, reply) {
      return Promise.resolve().then(function () {
        return _logic.ConnectorLogic.setupDefaultConnector(request.auth.credentials.application, request.payload.connectorType);
      }).then(function (connector) {
        return _logic.ConnectorLogic.getAuthUrl(connector, request.auth.credentials.organisation.slug, request.auth.credentials.application.slug);
      }).then(function (uri) {
        reply({
          uri: uri
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
        method: ['GET'],
        path: '/connectors',
        config: {
          handler: this.list,
          auth: {
            strategy: 'session'
          }
        }
      }, {
        method: ['GET'],
        path: '/connector/bundle/{connectorType}/{bundle}',
        config: {
          handler: this.connectorBundle,
          auth: {
            strategy: 'session'
          }
        }
      }, {
        method: ['POST'],
        path: '/connector/connect',
        config: {
          handler: this.connect,
          auth: {
            strategy: 'session'
          }
        }
      }];
    }
  }]);

  return ConnectorController;
}(_base_controller.BaseController);

exports.default = ConnectorController;
//# sourceMappingURL=../../../maps/server/areas/connector/connector_controller.js.map
