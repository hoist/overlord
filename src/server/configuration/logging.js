import {BaseConfigurator} from './base_configurator';
import path from 'path';
import HapiBunyan from 'hapi-bunyan';
import poop from 'poop';
import logger from '@hoist/logger';
import good from 'good';
import goodConsole from 'good-console';
/* istanbul ignore next */
export class LoggingConfigurator extends BaseConfigurator {
  configure (hapiServer) {
    return Promise
      .resolve()
      .then(() => {
        return hapiServer.registerAsync({
          register: HapiBunyan,
          options: {
            logger: logger.child({cls: 'HAPI_CORE'})
          }
        });
      })
      .then(() => {
        return hapiServer.registerAsync({
          register: poop,
          options: {
            logPath: path.join(process.cwd(), 'poop.log')
          }
        });
      })
      .then(() => {
        return hapiServer.registerAsync({
          register: good,
          options: {
            opsInterval: 1000,
            reporters: [
              {
                reporter: goodConsole,
                events: {
                  log: '*',
                  response: '*'
                }
              }
            ]
          }
        });
      })
  }
}
