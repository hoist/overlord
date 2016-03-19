import logger from '@hoist/logger';
/* istanbul ignore next */
export class BaseConfigurator {
  constructor () {
    this._logger = logger.child({cls: this.constructor.name});
  }
  configure () {
    return Promise.resolve();
  }
}
