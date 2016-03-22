"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FleetController = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _base_controller = require("../base_controller");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var dummyData = [{
  name: "beta.hoist.io@1.service",
  version: "v0.10.alpha"
}, {
  name: "beta.hoist.io@2.service",
  version: "v0.11.alpha"
}, {
  name: "executor@1.service",
  version: "v1.0.rc"
}, {
  name: "executor@2.service",
  version: "v1.0.rc"
}, {
  name: "executor@3.service",
  version: "v1.0.rc"
}, {
  name: "beta.hoist.io@1.service",
  version: "v0.10.alpha"
}, {
  name: "beta.hoist.io@2.service",
  version: "v0.11.alpha"
}, {
  name: "executor@1.service",
  version: "v1.0.rc"
}, {
  name: "executor@2.service",
  version: "v1.0.rc"
}, {
  name: "executor@3.service",
  version: "v1.0.rc"
}, {
  name: "beta.hoist.io@1.service",
  version: "v0.10.alpha"
}, {
  name: "beta.hoist.io@2.service",
  version: "v0.11.alpha"
}, {
  name: "executor@1.service",
  version: "v1.0.rc"
}, {
  name: "executor@2.service",
  version: "v1.0.rc"
}, {
  name: "executor@3.service",
  version: "v1.0.rc"
}];

/**
 * Controller for Fleet related actions
 * @extends {BaseController}
 */

var FleetController = exports.FleetController = function (_BaseController) {
  _inherits(FleetController, _BaseController);

  /**
   * create a new FleetController
   */

  function FleetController() {
    _classCallCheck(this, FleetController);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(FleetController).call(this));
  }

  _createClass(FleetController, [{
    key: "getStatus",
    value: function getStatus(request, reply) {
      return Promise.resolve().then(function () {
        reply(dummyData);
      });
    }

    /**
     * @override
     * @returns {Array<Object>} - an array of route configurations @see http://hapijs.com/api#route-configuration
     */

  }, {
    key: "routes",
    value: function routes() {
      return [{
        method: ['GET'],
        path: '/fleet/status',
        config: {
          handler: this.getStatus,
          auth: {
            strategy: 'session',
            mode: 'try'
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

  return FleetController;
}(_base_controller.BaseController);

exports.default = FleetController;
//# sourceMappingURL=../../../maps/server/areas/fleet/fleet_controller.js.map
