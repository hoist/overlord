import {_mongoose} from '@hoist/model';
import errors from '@hoist/errors';
import logger from '@hoist/logger';
import path from 'path';
import Boom from 'boom';
/**
 * a base interface for controller classes
 */
/* istanbul ignore next */
export class BaseController {
  /**
   * create a new BaseController
   */
  constructor () {
    this._logger = logger.child({cls: this.constructor.name})
  }

  /**
   * load all routes exposed by this controller, with default configurations
   */
  _loadRoutes (hapiServer) {
    return Promise
      .resolve()
      .then(() => {
        this
          ._logger
          .info('setting up routes for controller');
        return this.routes();
      })
      .then((routes) => {
        return routes || [];
      })
      .then((routes) => {
        this
          ._logger
          .debug({
            routes: routes.length
          }, 'mapping routes');
        return routes.map((route) => this._ensureRouteValid(route));
      })
      .then((routes) => {
        this
          ._logger
          .debug('sending routes to server');
        return hapiServer.route(routes);
      });
  }

  /**
   * ensure the route has all the defaults set up correctly
   */
  _ensureRouteValid (routeObject) {
    //ensure we have a config object
    routeObject.config = routeObject.config || {};
    if (routeObject.handler) {
      this
        ._logger
        .debug('moving handler to config object')
      routeObject.config.handler = routeObject.handler;
      delete routeObject.handler;
    }
    if (routeObject.config.handler) {
      let handler = routeObject
        .config
        .handler
        .bind(this);
      routeObject.config.handler = (req, reply) => {
        return Promise
          .resolve()
          .then(() => handler(req, reply))
          .catch((err) => {
            this._onRequestError(req, reply, err);
          })
          .catch((err) => {
            this
              ._logger
              .alert(err);
            this
              ._logger
              .error(err);
          });
      }
    }
    //ensure we have an auth setup
    if (routeObject.config.auth === undefined || routeObject.config.auth === null) {
      this
        ._logger
        .debug('adding auth to route');
      routeObject.config.auth = {
        strategy: 'session'
      }
    }
    if (!routeObject.path.startsWith('/api')) {
      this
        ._logger
        .debug('setting api path');
      routeObject.path = path.join('/api', routeObject.path);
    }
    return routeObject;
  }

  /**
   * expose routes for the controller
   * @abstract
   * @returns {Array<Object>} - an array of route configurations @see http://hapijs.com/api#route-configuration
   */
  routes () {
    this
      ._logger
      .error('controller should redefine the #routes methods');
    throw new Error("controllers should override #routes");
  }

  /**
   * this is a generic controller error handler, you shouldn't really get here but is a catch if exception handling hasn't been done
   */
  _onRequestError (request, reply, error) {
    this
      ._logger
      .error(error);
    if (error instanceof _mongoose.Error) {
      if (error instanceof _mongoose.Error.ValidationError) {
        var boom = Boom.badRequest(error.message);
        boom.output.payload.errors = error.errors;
        error = boom;
      }
    }
    if (error.isBoom) {
      return reply(error);
    } else if (!errors.isHoistError(error)) {
      error = new errors.HoistError();
    }
    reply(Boom.wrap(error, error.code || 500));

  }
}

/**
 * @external {HapiRequest} http://hapijs.com/api#request-object
 * @external {HapiReply} http://hapijs.com/api#reply-interface
 */
