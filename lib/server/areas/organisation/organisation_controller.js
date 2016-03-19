'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OrganisationController = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _base_controller = require('../base_controller');

var _model = require('@hoist/model');

var _errors = require('@hoist/errors');

var _errors2 = _interopRequireDefault(_errors);

var _utils = require('../../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Controller for user actions related their Organisations
 * @extends {BaseController}
 */

var OrganisationController = exports.OrganisationController = function (_BaseController) {
  _inherits(OrganisationController, _BaseController);

  /**
   * create a new OrganistionController
   */

  function OrganisationController() {
    _classCallCheck(this, OrganisationController);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(OrganisationController).call(this));
  }

  _createClass(OrganisationController, [{
    key: '_createSlugFromName',
    value: function _createSlugFromName(name) {
      var _this2 = this;

      var postfix = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

      name = _utils.StringUtils.sanitiseName(name);
      return _model.Organisation.countAsync({
        slug: name + postfix
      }).then(function (count) {
        if (count > 0) {
          //colision so add number
          return _this2._createSlugFromName(name, Math.floor(Math.random() * 10000));
        }
        return name + postfix;
      });
    }

    /**
     * create a Organisation
     * @param {HapiRequest} request - the login HTTP request
     * @param {HapiReply} reply - the reply to send to the user
     * @return {Promise}
     */

  }, {
    key: 'create',
    value: function create(request, reply) {
      var _this3 = this;

      return Promise.resolve().then(function () {
        if (!request.payload.name || request.payload.name.length < 1) {
          throw new _errors2.default.Http400Error('Organisation Name must be supplied');
        }
      }).then(function () {
        return _this3._createSlugFromName(request.payload.name).then(function (slug) {
          return { name: request.payload.name, slug: slug };
        });
      }).then(function (organisationDetails) {
        return new _model.Organisation(organisationDetails).saveAsync();
      }).then(function (organisation) {
        if (organisation.length) {
          organisation = organisation[0];
        }
        return _model.HoistUser.updateAsync({
          _id: request.auth.credentials.user._id
        }, {
          $push: {
            organisations: organisation._id
          }
        }).then(function () {
          return { _id: organisation._id, slug: organisation.slug, name: organisation.name, isPersonal: organisation.isPersonal };
        });
      }).then(function (organisation) {
        reply(organisation).code(201);
        return _model.Session.updateAsync({
          _id: request.auth.credentials._id
        }, {
          $set: {
            organisation: organisation._id
          }
        });
      });
    }

    /**
     * returns the organisation details represented by the slug of the request
     * @param {HapiRequest} request - the login HTTP request
     * @param {HapiReply} reply - the reply to send to the user
     * @return {Promise}
     */

  }, {
    key: 'fetch',
    value: function fetch(request, reply) {
      return Promise.resolve().then(function () {
        return _model.Organisation.findOneAsync({
          _id: {
            $in: request.auth.credentials.user.organisations
          },
          slug: request.params.slug
        });
      }).then(function (organisation) {
        if (!organisation) {
          throw new _errors2.default.Http404Error('Organisation could not be found');
        } else {
          reply(organisation);
        }
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
        method: ['POST'],
        path: '/organisation',
        config: {
          handler: this.create,
          auth: {
            strategy: 'session'
          }
        }
      }, {
        method: ['GET'],
        path: '/organisation/{slug}',
        config: {
          handler: this.fetch,
          auth: {
            strategy: 'session'
          }
        }
      }];
    }
  }]);

  return OrganisationController;
}(_base_controller.BaseController);

exports.default = OrganisationController;
//# sourceMappingURL=../../../maps/server/areas/organisation/organisation_controller.js.map
