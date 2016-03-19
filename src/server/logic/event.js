import logger from '@hoist/logger';

const _logger = logger.child({
  cls: 'EventLogic'
});
export function mapEventToModule(event, settings) {

  if (!settings || !settings.live) {
    return Promise.resolve(null);
  }
  settings = settings.live;
  _logger.info({
    event,
    settings
  }, 'mapping event to module');
  return Promise
    .resolve()
    .then(() => {
      return settings.on[event];
    })
    .then((eventMapping) => {
      if (eventMapping) {
        _logger.info('found matching event mapping');
        return (eventMapping.modules || [])
          .map((moduleName) => {
            return settings
              .modules
              .find((module) => {
                return module.name === moduleName
              });
          })
      }
    })
    .then((modules) => {
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
export function getEvents(settings) {
  if (!settings || !settings.live) {
    return Promise.resolve([]);
  }
  settings = settings.live;
  return Promise
    .resolve()
    .then(() => {
      if (!settings.on) {
        return [];
      }
      return Object
        .keys(settings.on)
        .map((evName) => ({
          name: evName,
          description: '',
          key: evName
        }));
    });
}
export function createEvent(application, eventName) {
  return Promise
    .resolve()
    .then(() => {
      application.settings = application.settings;
      application.settings.live = application.settings.live || {};
      application.settings.live.on = application.settings.live.on || {};
      application.settings.live.on[eventName] = application.settings.live.on[eventName] || {
        modules: []
      };
      return application.saveAsync();
    })
    .then(() => {
      return eventName;
    });

}

export function createModuleForEvent(eventName, application) {
  return Promise
    .resolve()
    .then(() => {
      let module = {
        name: `${eventName}-module`,
        src: `./hoist-modules/${eventName}.js`
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
      return application.saveAsync()
        .then(() => module);
    });
}
