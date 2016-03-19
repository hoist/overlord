'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ServerConfigurator = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _base_configurator = require('./base_configurator');

var _config = require('config');

var _config2 = _interopRequireDefault(_config);

var _vision = require('vision');

var _vision2 = _interopRequireDefault(_vision);

var _handlebars = require('handlebars');

var _handlebars2 = _interopRequireDefault(_handlebars);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _inert = require('inert');

var _inert2 = _interopRequireDefault(_inert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
//import WebpackConfig from '../../../config/webpack/webpack.config';


//const compiler = Webpack(WebpackConfig);
/* istanbul ignore next */

var ServerConfigurator = exports.ServerConfigurator = function (_BaseConfigurator) {
  _inherits(ServerConfigurator, _BaseConfigurator);

  function ServerConfigurator() {
    _classCallCheck(this, ServerConfigurator);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(ServerConfigurator).call(this));
  }

  _createClass(ServerConfigurator, [{
    key: 'configure',
    value: function configure(hapiServer) {
      var _this2 = this;

      return Promise.resolve().then(function () {
        return _this2._configureMainConnection(hapiServer);
      }).then(function () {
        return _this2._configureWebpack(hapiServer);
      }).then(function () {
        return _this2._configureViewEngine(hapiServer);
      });
    }
  }, {
    key: '_configureMainConnection',
    value: function _configureMainConnection(hapiServer) {
      return hapiServer.connection({ host: '0.0.0.0', port: 8000 });
    }
  }, {
    key: '_configureWebpack',
    value: function _configureWebpack(hapiServer) {
      if (!_config2.default.get('Hoist.webpack.optimize')) {
        var Webpack = require('webpack');
        var webpackConfig = require('../../../config/webpack/webpack.config');
        var compiler = Webpack(webpackConfig);
        return hapiServer.registerAsync({
          register: require('hapi-webpack-plugin'),
          options: {
            compiler: compiler,
            hot: {},
            assets: webpackConfig.assets
          }
        });
        // Do "hot-reloading" of react stuff on the server
        // Throw away the cached client modules and let them be re-required next time
        compiler.plugin('done', function () {
          Object.keys(require.cache).forEach(function (id) {
            if (/\/client\//.test(id)) delete require.cache[id];
          });
        });
      }
    }
  }, {
    key: '_configureViewEngine',
    value: function _configureViewEngine(hapiServer) {
      return hapiServer.registerAsync(_vision2.default).then(function () {
        _handlebars2.default.registerHelper('json', JSON.stringify);
        return hapiServer.views({
          engines: {
            hbs: _handlebars2.default
          },
          isCached: false,
          relativeTo: _path2.default.resolve(__dirname, '../'),
          path: 'views'
        });
      }).then(function () {
        return hapiServer.registerAsync(_inert2.default);
      });
    }
  }]);

  return ServerConfigurator;
}(_base_configurator.BaseConfigurator);
//# sourceMappingURL=../../maps/server/configuration/server.js.map
