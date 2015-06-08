'use strict';
import ControllerBase from '../controller_base';
import Environment from '../../../models/environment';
import Boom from 'boom';

class EnvironmentController extends ControllerBase {
  constructor() {
    super();
    this.name = "Environments API";
    this.routes = this.routes.concat([{
      method: 'POST',
      path: '/api/environment',
      config: {
        handler: this.create,
        auth: {
          strategy: 'session'
        },
        plugins: {
          'hapi-auth-cookie': {
            redirectTo: false
          }
        }
      }
    }, {
      method: 'PUT',
      path: '/api/environment/{slug?}',
      config: {
        handler: this.update,
        auth: {
          strategy: 'session'
        },
        plugins: {
          'hapi-auth-cookie': {
            redirectTo: false
          }
        }
      }
    }]);
  }
  update(request, reply) {
    return Environment.count({
      name: request.payload.name,
      slug: {
        $ne: request.params.slug
      }
    }).then((count) => {
      if (count > 0) {
        let boom = Boom.conflict('an environment with that name already exists', {
          problem: 'Environment names must be unique',
          resolution: 'use a different environment name'
        });
        boom.output.payload.errors = {
          name: {
            message: 'An environment with that name already exists'
          }
        };
        throw boom;
      }
      return Environment.findOne({
        slug: request.params.slug
      });
    }).then((environment) => {
      if (!environment) {
        console.log('no environment found');
        throw Boom.notFound('no environment with that slug found');
      }
      environment.name = request.payload.name;
      environment.fleetUrl = request.payload.fleetUrl;
      environment.slug = undefined;
      return environment.saveAsync().spread((env) => {
        let response = reply(env.toJSON());
        response.statusCode = 200;
      });
    });
  }
  create(request, reply) {
    return Environment.count({
      name: request.payload.name
    }).then((count) => {
      if (count > 0) {
        let boom = Boom.conflict('an environment with that name already exists', {
          problem: 'Environment names must be unique',
          resolution: 'use a different environment name'
        });
        boom.output.payload.errors = {
          name: {
            message: 'An environment with that name already exists'
          }
        };
        throw boom;
      }
    }).then(function () {
      return new Environment({
        name: request.payload.name,
        fleetUrl: request.payload.fleetUrl
      }).saveAsync().spread((env) => {
        let response = reply(env.toJSON());
        response.statusCode = 201;
      });
    });

  }
}

export default EnvironmentController;
