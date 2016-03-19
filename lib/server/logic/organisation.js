'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.create = create;

var _model = require('@hoist/model');

var _slug = require('slug');

var _slug2 = _interopRequireDefault(_slug);

var _errors = require('@hoist/errors');

var _errors2 = _interopRequireDefault(_errors);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function create(_ref) {
  var _ref$personal = _ref.personal;
  var personal = _ref$personal === undefined ? false : _ref$personal;
  var name = _ref.name;
  var _ref$slug = _ref.slug;
  var slug = _ref$slug === undefined ? null : _ref$slug;

  return Promise.resolve((0, _slug2.default)(slug || name)).then(function (slug) {
    return _model.Organisation.countAsync({ slug: slug }).then(function (slugColisions) {
      if (slugColisions > 0) {
        throw new _errors2.default.HoistError('an organisaiton with that slug already exists');
      }
    }).then(function () {
      return new _model.Organisation({ personal: personal, name: name, slug: slug }).saveAsync();
    });
  });
}
//# sourceMappingURL=../../maps/server/logic/organisation.js.map
