'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.getAllSettings = getAllSettings;

var _config = require('config');

var _config2 = _interopRequireDefault(_config);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _connector = require('./connector');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_bluebird2.default.promisifyAll(_fs2.default);

function getAllSettings() {
  return _bluebird2.default.resolve().then(function () {
    return _bluebird2.default.all([(0, _connector.getAvailableConnectors)()]);
  }).then(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 1);

    var availableConnectors = _ref2[0];

    return { availableConnectors: availableConnectors };
  });
}
//# sourceMappingURL=../../maps/server/logic/settings.js.map
