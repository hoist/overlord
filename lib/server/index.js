'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _hapi = require('hapi');

var _hapi2 = _interopRequireDefault(_hapi);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _configuration = require('./configuration');

var _configuration2 = _interopRequireDefault(_configuration);

var _logger = require('@hoist/logger');

var _logger2 = _interopRequireDefault(_logger);

var _config = require('config');

var _config2 = _interopRequireDefault(_config);

var _model = require('@hoist/model');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

_model._mongoose.set('debug', true);
/**
 * The main portal server itself
 */

var PortalServer = function () {
  /**
   * create a new portal server
   */

  function PortalServer() {
    _classCallCheck(this, PortalServer);

    this._logger = _logger2.default.child({ cls: this.constructor.name });
  }

  _createClass(PortalServer, [{
    key: '_createServer',
    value: function _createServer() {
      var _this = this;

      return Promise.resolve().then(function () {
        _this._hapiServer = new _hapi.Server();
        _bluebird2.default.promisifyAll(_this._hapiServer);
      }).then(function () {
        return _configuration2.default.server.configure(_this._hapiServer);
      }).then(function () {
        return _configuration2.default.logging.configure(_this._hapiServer);
      }).then(function () {
        return _configuration2.default.auth.configure(_this._hapiServer);
      }).then(function () {
        return _configuration2.default.routes.configure(_this._hapiServer);
      }).then(function () {
        return _this._hapiServer;
      });
    }

    /**
     * start the server and connect to mongo
     * @returns {Promise} - for the server to have started
     */

  }, {
    key: 'start',
    value: function start() {
      var _this2 = this;

      return _model._mongoose.connectAsync(_config2.default.get('Hoist.mongo.core.connectionString')).then(function () {
        return _this2._createServer();
      }).then(function () {
        return _this2._hapiServer.startAsync();
      }).then(function () {
        _this2._logger.info({
          info: _this2._hapiServer.info
        }, 'server listening');
      }).catch(function (err) {
        _this2._logger.error(err);
        _this2._logger.alert(err);
      });
    }
  }]);

  return PortalServer;
}();

exports.default = PortalServer;
//# sourceMappingURL=../maps/server/index.js.map
