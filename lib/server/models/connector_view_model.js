'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ConnectorViewModel = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _config = require('config');

var _config2 = _interopRequireDefault(_config);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

_bluebird2.default.promisifyAll(_fs2.default);
/**
 * this is a cut down class for views to look at connector settings
 */

var ConnectorViewModel = exports.ConnectorViewModel = function () {
  /**
   * create a new connector view model from ConnectorSetting
   * @param {ConnectorSetting} connectorSetting
   */

  function ConnectorViewModel(connectorSetting) {
    _classCallCheck(this, ConnectorViewModel);

    this._connectorSetting = connectorSetting;
  }

  _createClass(ConnectorViewModel, [{
    key: '_connectorPath',
    value: function _connectorPath() {
      return _path2.default.resolve(_path2.default.join(_config2.default.get('Hoist.filePaths.connectors'), this.type, 'current'));
    }

    /**
     * @returns {string} - the key for this connector
     */

  }, {
    key: 'codeForEvent',
    value: function codeForEvent(event) {
      var _this = this;

      //returns the sample code for an event for this connector
      return _bluebird2.default.resolve().then(function () {
        var codePath = _path2.default.join(_this._connectorPath(), 'samples', event.name + '.js');
        if (!_fs2.default.existsSync(codePath)) {
          return null;
        } else {
          return _fs2.default.readFileAsync(codePath, { encoding: 'utf8' });
        }
      });
    }

    /**
     * populates the parts of the model that can't be done syncronously
     * @returns {Promise} when the model has been populated
     */

  }, {
    key: 'populate',
    value: function populate() {
      var _this2 = this;

      return _bluebird2.default.resolve().then(function () {
        //load up the connector.json
        return require(_path2.default.join(_this2._connectorPath(), 'connector.json'));
      }).then(function (connectorJson) {
        _this2._connectorJson = connectorJson;
        if (connectorJson.events) {
          return connectorJson.events.map(function (_ref) {
            var description = _ref.description;
            var name = _ref.name;
            return { description: description, name: name, connector: '' + _this2.key, key: _this2.key + ':' + name };
          });
        } else {
          return _lodash2.default.flatten(_lodash2.default.map(connectorJson.endpoints, function (endpoint, name) {
            var eventsNames = undefined;
            if (endpoint.events) {
              return endpoint.events.map(function (eventName) {
                return { description: '', name: eventName + ':' + name, connector: '' + _this2.key, key: _this2.key + ':' + eventName + ':' + name };
              });
            } else {
              return [{
                description: '',
                name: 'new:' + name,
                connector: '' + _this2.key,
                key: _this2.key + ':new:' + name
              }, {
                description: '',
                name: 'modified:' + name,
                connector: '' + _this2.key,
                key: _this2.key + ':modified:' + name
              }, {
                description: '',
                name: 'deleted:' + name,
                connector: '' + _this2.key,
                key: _this2.key + ':deleted:' + name
              }];
            }
          }));
        }
      }).then(function (events) {
        _this2._events = events;
      });
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return Object.assign({}, {
        key: this.key,
        name: this.name,
        events: this.events,
        settings: this.settings,
        type: this.type
      });
    }
  }, {
    key: 'key',
    get: function get() {
      return this._connectorSetting.key;
    }

    /**
     * @returns {String} the name of this connector
     */

  }, {
    key: 'name',
    get: function get() {
      return this._connectorSetting.name;
    }

    /**
     * @returns {string} the type of this connector
     */

  }, {
    key: 'type',
    get: function get() {
      return this._connectorSetting.connectorType;
    }

    /**
     * @returns {Object} the settings for this connector
     */

  }, {
    key: 'settings',
    get: function get() {
      return this._connectorSetting.settings;
    }

    /**
     * @returns {Array<Object>} a list of available events for this connector
     */

  }, {
    key: 'events',
    get: function get() {
      return this._events;
    }
  }]);

  return ConnectorViewModel;
}();
//# sourceMappingURL=../../maps/server/models/connector_view_model.js.map
