import {
  mapEventToModule,
  createModuleForEvent
} from './event';
import {
  getApplicationPath
} from './application';
import {
  Application
} from '@hoist/model';
import Bluebird from 'bluebird';
import path from 'path';
import fs from 'fs';
import logger from '@hoist/logger';
import mkdirp from 'mkdirp';
Bluebird.promisifyAll(fs);

const _logger = logger.child({
  cls: 'EditorLogic'
});

export function getCodeForEvent(applicationId, event) {
  return Application.findOne({
      _id: applicationId

    }, 'slug organisation settings')
    .populate({
      path: 'organisation',
      select: 'slug'
    })
    .exec()
    .then((application) => {
      _logger.info({
        event: event.key
      }, "mapping event to module");
      return getEventFilePath(event.key, application)
        .then((modulePath) => {
          _logger.info({
            modulePath: modulePath
          }, 'loading module');
          if (modulePath && fs.existsSync(modulePath)) {
            return fs.readFileAsync(modulePath, {
              encoding: 'utf8'
            });

          }
          _logger.info('module doesnt exist on disk');
          return null;
        });
    });
}

function getEventFilePath(eventName, application) {
  return mapEventToModule(eventName, application.settings)
    .then((module) => {
      return getModulePath(module, application);
    });
}

function getModulePath(module, application) {
  return Promise.resolve()
    .then(() => {
      if (module && module.src) {
        _logger.info({
          module: module
        }, "loading module for event");
        return getApplicationPath(application)
          .then((applicationPath) => {
            return path.resolve(applicationPath, module.src);
          });
      } else {
        return null;
      }
    });
}


export function saveScript({
  eventName,
  organisation,
  application,
  script
}) {
  return getEventFilePath(eventName, application)
    .then((eventFilePath) => {
      if (!eventFilePath) {
        return createModuleForEvent(eventName, application)
          .then((module) => {
            return getModulePath(module, application);
          });
      }
      return eventFilePath;
    })
    .then((filePath) => {
      return Bluebird.promisify(mkdirp)(path.dirname(filePath))
        .then(() => {
          return fs.writeFileAsync(filePath, script, {
            encoding: 'utf8'
          });
        });
    });
}
