'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BaseConfigurator = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _logger = require('@hoist/logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* istanbul ignore next */

var BaseConfigurator = exports.BaseConfigurator = function () {
  function BaseConfigurator() {
    _classCallCheck(this, BaseConfigurator);

    this._logger = _logger2.default.child({ cls: this.constructor.name });
  }

  _createClass(BaseConfigurator, [{
    key: 'configure',
    value: function configure() {
      return Promise.resolve();
    }
  }]);

  return BaseConfigurator;
}();
//# sourceMappingURL=../../maps/server/configuration/base_configurator.js.map
