'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCodeForEvent = getCodeForEvent;
exports.saveScript = saveScript;

var _event = require('./event');

var _application = require('./application');

var _model = require('@hoist/model');

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _logger2 = require('@hoist/logger');

var _logger3 = _interopRequireDefault(_logger2);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_bluebird2.default.promisifyAll(_fs2.default);

var _logger = _logger3.default.child({
  cls: 'EditorLogic'
});

function getCodeForEvent(applicationId, event) {
  return _model.Application.findOne({
    _id: applicationId

  }, 'slug organisation settings').populate({
    path: 'organisation',
    select: 'slug'
  }).exec().then(function (application) {
    _logger.info({
      event: event.key
    }, "mapping event to module");
    return getEventFilePath(event.key, application).then(function (modulePath) {
      _logger.info({
        modulePath: modulePath
      }, 'loading module');
      if (modulePath && _fs2.default.existsSync(modulePath)) {
        return _fs2.default.readFileAsync(modulePath, {
          encoding: 'utf8'
        });
      }
      _logger.info('module doesnt exist on disk');
      return null;
    });
  });
}

function getEventFilePath(eventName, application) {
  return (0, _event.mapEventToModule)(eventName, application.settings).then(function (module) {
    return getModulePath(module, application);
  });
}

function getModulePath(module, application) {
  return Promise.resolve().then(function () {
    if (module && module.src) {
      _logger.info({
        module: module
      }, "loading module for event");
      return (0, _application.getApplicationPath)(application).then(function (applicationPath) {
        return _path2.default.resolve(applicationPath, module.src);
      });
    } else {
      return null;
    }
  });
}

function saveScript(_ref) {
  var eventName = _ref.eventName;
  var organisation = _ref.organisation;
  var application = _ref.application;
  var script = _ref.script;

  return getEventFilePath(eventName, application).then(function (eventFilePath) {
    if (!eventFilePath) {
      return (0, _event.createModuleForEvent)(eventName, application).then(function (module) {
        return getModulePath(module, application);
      });
    }
    return eventFilePath;
  }).then(function (filePath) {
    return _bluebird2.default.promisify(_mkdirp2.default)(_path2.default.dirname(filePath)).then(function () {
      return _fs2.default.writeFileAsync(filePath, script, {
        encoding: 'utf8'
      });
    });
  });
}
//# sourceMappingURL=../../maps/server/logic/editor.js.map
