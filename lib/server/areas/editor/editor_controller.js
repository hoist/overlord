'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EditorController = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _base_controller = require('../base_controller');

var _logic = require('../../logic');

var _lodash = require('lodash');

var _errors = require('@hoist/errors');

var _errors2 = _interopRequireDefault(_errors);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Controller for user actions related their Organisations
 * @extends {BaseController}
 */

var EditorController = exports.EditorController = function (_BaseController) {
  _inherits(EditorController, _BaseController);

  /**
   * create a new OrganistionController
   */

  function EditorController() {
    _classCallCheck(this, EditorController);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(EditorController).call(this));
  }

  /**
   * gets state data to populate the editor
   * @param {HapiRequest} request - the login HTTP request
   * @param {HapiReply} reply - the reply to send to the user
   * @return {Promise}
   */


  _createClass(EditorController, [{
    key: 'state',
    value: function state(request, reply) {
      var _this2 = this;

      var data = {};
      return Promise.resolve().then(function () {
        if (request.auth.credentials.application) {
          return _logic.ConnectorLogic.getConnectorsForApplication(request.auth.credentials.application);
        } else {
          return [];
        }
      }).then(function (connectors) {
        data.connectors = connectors;
        if (connectors.length > 0 && connectors[0].events.length > 0) {
          return _logic.EditorLogic.getCodeForEvent(request.auth.credentials.application, connectors[0].events[0]).then(function (code) {
            if (code) {
              return code;
            } else {
              return connectors[0].codeForEvent(connectors[0].events[0]).then(function (code) {
                if (!code) {
                  return "";
                } else {
                  return code;
                }
              });
            }
          }).then(function (code) {
            _this2._logger.info({
              codeLength: code.length
            }, 'got code for event');
            data.code = {
              event: connectors[0].events[0].key,
              script: code
            };
          });
        }
      }).then(function () {
        var events = (0, _lodash.flatten)(data.connectors.map(function (c) {
          return c.events;
        }));
        return _logic.EventLogic.getEvents(request.auth.credentials.application.settings).then(function (applicationEvents) {
          events = events.concat(applicationEvents);
          data.events = (0, _lodash.uniq)(events, function (ev) {
            return ev.key;
          });
        });
      }).then(function () {
        reply(data);
      });
    }
  }, {
    key: 'script',
    value: function script(request, reply) {
      return Promise.resolve().then(function () {
        var key = request.params.event;
        var eventParts = key.split(":");
        var connectorKey = eventParts[0];
        var eventName = eventParts.slice((eventParts.length - 1) * -1).join(":");
        if (connectorKey.length < 0) {
          key = eventName;
        }
        return _logic.EditorLogic.getCodeForEvent(request.auth.credentials.application, {
          key: key
        }).then(function (module) {
          if (!module && connectorKey && connectorKey.length > 0) {
            return _logic.ConnectorLogic.loadConnector(request.auth.credentials.application._id, connectorKey).then(function (connector) {
              if (connector) {
                return connector.codeForEvent({
                  name: eventName
                });
              }
            });
          }
          return module;
        }).then(function (code) {
          return code || "";
        }).then(function (code) {
          reply({
            event: key,
            script: code
          });
        });
      });
    }
  }, {
    key: 'saveScript',
    value: function saveScript(request, reply) {
      return Promise.resolve().then(function () {
        var script = request.payload.code;
        var eventName = request.params.eventName;
        var application = request.auth.credentials.application;
        var organisation = request.auth.credentials.organisation;
        return _logic.EditorLogic.saveScript({
          eventName: eventName,
          application: application,
          organisation: organisation,
          script: script
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
        method: 'GET',
        path: '/editor/state',
        config: {
          handler: this.state,
          auth: {
            strategy: 'session'
          }
        }
      }, {
        method: 'GET',
        path: '/editor/script/{event}',
        config: {
          handler: this.script,
          auth: {
            strategy: 'session'
          }
        }
      }, {
        method: 'POST',
        path: '/editor/script/{eventName}',
        config: {
          handler: this.saveScript,
          auth: {
            strategy: 'session'
          }
        }
      }];
    }
  }]);

  return EditorController;
}(_base_controller.BaseController);

exports.default = EditorController;
//# sourceMappingURL=../../../maps/server/areas/editor/editor_controller.js.map
