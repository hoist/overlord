'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HealthcheckController = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _base_controller = require('../base_controller');

var _model = require('@hoist/model');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Controller for actions related to healthchecks
 * @extends {BaseController}
 */

var HealthcheckController = exports.HealthcheckController = function (_BaseController) {
  _inherits(HealthcheckController, _BaseController);

  /**
   * create a new HealthcheckController
   */

  function HealthcheckController() {
    _classCallCheck(this, HealthcheckController);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(HealthcheckController).call(this));
  }

  /**
   * simple heartbeat that returns 200 if server and db connection are up and running
   * @param {HapiRequest} request - the login HTTP request
   * @param {HapiReply} reply - the reply to send to the user
   * @return {Promise}
   */


  _createClass(HealthcheckController, [{
    key: 'healthcheck',
    value: function healthcheck(request, reply) {
      return new Promise(function (resolve) {
        var ok = true;
        var result = {};
        if (_model._mongoose.connection.readyState !== 1) {
          result.db = 'fail';
          ok = false;
        } else {
          result.db = 'pass';
        }
        if (ok) {
          reply(result);
        } else {
          var response = reply(result);
          response.statusCode = 500;
        }
        resolve();
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
        path: '/healthcheck',
        config: {
          handler: this.healthcheck,
          auth: false
        }
      }];
    }
  }]);

  return HealthcheckController;
}(_base_controller.BaseController);

exports.default = HealthcheckController;
//# sourceMappingURL=../../../maps/server/areas/healthcheck/healthcheck_controller.js.map
