'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EventController = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _base_controller = require('../base_controller');

var _logic = require('../../logic');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Controller for user actions related events
 * @extends {BaseController}
 */

var EventController = exports.EventController = function (_BaseController) {
  _inherits(EventController, _BaseController);

  /**
   * create a new OrganistionController
   */

  function EventController() {
    _classCallCheck(this, EventController);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(EventController).call(this));
  }
  /**
  *
  */


  _createClass(EventController, [{
    key: 'create',
    value: function create(request, reply) {
      return Promise.resolve().then(function () {
        return _logic.EventLogic.createEvent(request.auth.credentials.application, request.payload.eventName);
      }).then(function (eventName) {
        return { name: eventName, description: '', key: eventName };
      }).then(function (event) {
        reply(event);
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
        method: 'POST',
        path: '/event',
        config: {
          handler: this.create,
          auth: {
            strategy: 'session'
          }
        }
      }];
    }
  }]);

  return EventController;
}(_base_controller.BaseController);

exports.default = EventController;
//# sourceMappingURL=../../../maps/server/areas/event/event_controller.js.map
