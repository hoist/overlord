'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ConsoleController = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _base_controller = require('../base_controller');

var _logic = require('../../logic');

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _errors = require('@hoist/errors');

var _errors2 = _interopRequireDefault(_errors);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Controller for actions related to the developer console
 * @extends {BaseController}
 */

var ConsoleController = exports.ConsoleController = function (_BaseController) {
  _inherits(ConsoleController, _BaseController);

  /**
   * create a new ConsoleController
   */

  function ConsoleController() {
    _classCallCheck(this, ConsoleController);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(ConsoleController).call(this));
  }

  /**
   * gets state data to populate the editor
   * @param {HapiRequest} request - the login HTTP request
   * @param {HapiReply} reply - the reply to send to the user
   * @return {Promise}
   */


  _createClass(ConsoleController, [{
    key: 'get',
    value: function get(request, reply) {
      var _this2 = this;

      if (process.env.TEST_CONSOLE) {
        return Promise.resolve().then(function () {
          reply({
            "messages": [{
              "id": "5dff5df9b09054439c95feda720a084d27b6a71f",
              "type": "DEPLOY",
              "message": "mDeploy complete. Hash: 5dff5df9b09054439c95feda720a084d27b6a71f",
              "time": "01:17:02",
              "stack": []
            }, {
              "id": "56e21c8c39838a18008c5663",
              "type": "MDL",
              "message": "module pingLog starting (from event id: c43ae06b70464895b8a8e5174c659863)",
              "time": "01:17:02",
              "stack": []
            }, {
              "id": "56e21c8c39838a18008c5664",
              "type": "LOG",
              "message": "[\"got a ping\",{\"eventId\":\"c43ae06b70464895b8a8e5174c659863\",\"applicationId\":\"demo-connect-app\",\"eventName\":\"ping:me\",\"environment\":\"live\",\"correlationId\":\"582daa27-e1bc-4ce7-8b79-16a925ec14c7\",\"_id\":\"56e21c8c40cd5339004a39e3\"}]",
              "time": "01:17:02",
              "stack": []
            }, {
              "id": "56e21c8c40cd5339004a39e7",
              "type": "EVT",
              "message": "event ping:me raised (id: c43ae06b70464895b8a8e5174c659863)",
              "time": "01:17:02",
              "stack": []
            }, {
              "id": "56e21c8c39838a18008c5665",
              "type": "MDL",
              "message": "module pingLog completed in 8.023706ms (from event id: c43ae06b70464895b8a8e5174c659863)",
              "time": "01:17:02",
              "stack": []
            }, {
              "id": "56e21c8c39838a18008c5666",
              "type": "EVT",
              "message": "event ping:me complete (id: c43ae06b70464895b8a8e5174c659863)",
              "time": "01:17:02",
              "stack": []
            }],
            "continuationToken": "b2ef3173-c459-4fb1-9e1f-c20a6e688368"
          });
        });
      }
      return Promise.resolve().then(function () {
        return request.query.continuationToken || _uuid2.default.v4();
      }).then(function (continuationToken) {
        return _logic.ConsoleLogic.getMessages(request.auth.credentials.application, continuationToken).then(function (messages) {
          _this2._logger.info({
            messages: messages
          }, 'reply from rabbit');
          reply({
            messages: messages,
            continuationToken: continuationToken
          });
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
        path: '/console',
        config: {
          handler: this.get,
          auth: {
            strategy: 'session'
          },
          plugins: {
            'hapi-auth-cookie': {
              redirectTo: false
            }
          }
        }
      }];
    }
  }]);

  return ConsoleController;
}(_base_controller.BaseController);

exports.default = ConsoleController;
//# sourceMappingURL=../../../maps/server/areas/console/console_controller.js.map
