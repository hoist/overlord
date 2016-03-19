'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getApplicationPath = getApplicationPath;
exports.create = create;

var _config = require('config');

var _config2 = _interopRequireDefault(_config);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _model = require('@hoist/model');

var _slug = require('slug');

var _slug2 = _interopRequireDefault(_slug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_bluebird2.default.promisifyAll(_fs2.default);

function getApplicationPath(application) {
  return _bluebird2.default.resolve().then(function () {
    if (!application.populated('organisation')) {
      return application.populate({ path: 'organisation', select: 'slug' }).execPopulate();
    }
  }).then(function () {
    return _path2.default.join(_config2.default.get('Hoist.filePaths.deploys'), application.organisation.slug, application.slug, 'current');
  }).then(function (currentPath) {
    if (_fs2.default.existsSync(currentPath)) {
      return _fs2.default.realpathAsync(currentPath);
    } else {
      return currentPath;
    }
  });
}
function create(_ref) {
  var name = _ref.name;
  var organisation = _ref.organisation;
  var _ref$slug = _ref.slug;
  var slug = _ref$slug === undefined ? null : _ref$slug;

  return _bluebird2.default.resolve((0, _slug2.default)(slug || name)).then(function (slug) {
    return new _model.Application({ name: name, organisation: organisation, slug: slug }).saveAsync();
  });
}
//# sourceMappingURL=../../maps/server/logic/application.js.map
