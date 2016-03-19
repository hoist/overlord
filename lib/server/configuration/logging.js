'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LoggingConfigurator = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _base_configurator = require('./base_configurator');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _hapiBunyan = require('hapi-bunyan');

var _hapiBunyan2 = _interopRequireDefault(_hapiBunyan);

var _poop = require('poop');

var _poop2 = _interopRequireDefault(_poop);

var _logger = require('@hoist/logger');

var _logger2 = _interopRequireDefault(_logger);

var _good = require('good');

var _good2 = _interopRequireDefault(_good);

var _goodConsole = require('good-console');

var _goodConsole2 = _interopRequireDefault(_goodConsole);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/* istanbul ignore next */

var LoggingConfigurator = exports.LoggingConfigurator = function (_BaseConfigurator) {
  _inherits(LoggingConfigurator, _BaseConfigurator);

  function LoggingConfigurator() {
    _classCallCheck(this, LoggingConfigurator);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(LoggingConfigurator).apply(this, arguments));
  }

  _createClass(LoggingConfigurator, [{
    key: 'configure',
    value: function configure(hapiServer) {
      return Promise.resolve().then(function () {
        return hapiServer.registerAsync({
          register: _hapiBunyan2.default,
          options: {
            logger: _logger2.default.child({ cls: 'HAPI_CORE' })
          }
        });
      }).then(function () {
        return hapiServer.registerAsync({
          register: _poop2.default,
          options: {
            logPath: _path2.default.join(process.cwd(), 'poop.log')
          }
        });
      }).then(function () {
        return hapiServer.registerAsync({
          register: _good2.default,
          options: {
            opsInterval: 1000,
            reporters: [{
              reporter: _goodConsole2.default,
              events: {
                log: '*',
                response: '*'
              }
            }]
          }
        });
      });
    }
  }]);

  return LoggingConfigurator;
}(_base_configurator.BaseConfigurator);
//# sourceMappingURL=../../maps/server/configuration/logging.js.map
