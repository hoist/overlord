'use strict';
import _ from 'lodash';
import logger from '@hoist/logger';
import Boom from 'boom';
import {
  Error
}
from 'mongoose';
class BaseController {
  constructor() {
    this.routes = [];
    this.name = "BaseController";
    _.bindAll(this);
    this.logger = logger.child({
      cls: this.constructor.name
    });
    this.logger.info('bound logger');
    this.logger.alert = logger.alert;
  }
  onError(request, reply, error) {
    logger.error(error);
    if (error instanceof Error) {
      if (error instanceof Error.ValidationError) {
        var boom = Boom.badRequest(error.message);
        boom.output.payload.errors = error.errors;
        error = boom;
      }
    }
    if (error.isBoom) {
      reply(error);
    } else {

      reply(Boom.wrap(error));
    }
  }
}


export default BaseController;
