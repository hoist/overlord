'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mapEventToModule = mapEventToModule;
exports.getEvents = getEvents;
exports.createEvent = createEvent;
exports.createModuleForEvent = createModuleForEvent;

var _logger2 = require('@hoist/logger');

var _logger3 = _interopRequireDefault(_logger2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _logger = _logger3.default.child({
  cls: 'EventLogic'
});
function mapEventToModule(event, settings) {

  if (!settings || !settings.live) {
    return Promise.resolve(null);
  }
  settings = settings.live;
  _logger.info({
    event: event,
    settings: settings
  }, 'mapping event to module');
  return Promise.resolve().then(function () {
    return settings.on[event];
  }).then(function (eventMapping) {
    if (eventMapping) {
      _logger.info('found matching event mapping');
      return (eventMapping.modules || []).map(function (moduleName) {
        return settings.modules.find(function (module) {
          return module.name === moduleName;
        });
      });
    }
  }).then(function (modules) {
    if (modules) {
      _logger.info({
        moduleLength: modules.length
      }, 'returning modules');
      if (modules && modules.length === 1) {
        return modules[0];
      } else {
        return modules;
      }
    } else {
      _logger.info('no modules found');
      return null;
    }
  });
}
function getEvents(settings) {
  if (!settings || !settings.live) {
    return Promise.resolve([]);
  }
  settings = settings.live;
  return Promise.resolve().then(function () {
    if (!settings.on) {
      return [];
    }
    return Object.keys(settings.on).map(function (evName) {
      return {
        name: evName,
        description: '',
        key: evName
      };
    });
  });
}
function createEvent(application, eventName) {
  return Promise.resolve().then(function () {
    application.settings = application.settings;
    application.settings.live = application.settings.live || {};
    application.settings.live.on = application.settings.live.on || {};
    application.settings.live.on[eventName] = application.settings.live.on[eventName] || {
      modules: []
    };
    return application.saveAsync();
  }).then(function () {
    return eventName;
  });
}

function createModuleForEvent(eventName, application) {
  return Promise.resolve().then(function () {
    var module = {
      name: eventName + '-module',
      src: './hoist-modules/' + eventName + '.js'
    };
    application.settings = application.settings;
    application.settings.live = application.settings.live || {};
    application.settings.live.modules = application.settings.live.modules || [];
    application.settings.live.on = application.settings.live.on || {};
    application.settings.live.on[eventName] = application.settings.live.on[eventName] || {
      modules: []
    };
    application.settings.live.modules.push(module);
    application.settings.live.on[eventName].modules.push(module.name);
    return application.saveAsync().then(function () {
      return module;
    });
  });
}
//# sourceMappingURL=../../maps/server/logic/event.js.map
