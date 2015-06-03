'use strict';
import ControllerBase from './controller_base';
import Environment from '../../models/environment';
import Boom from 'boom';

class EnvironmentController extends ControllerBase {
  constructor() {
    super();
    this.name = "Environments";
    this.routes = this.routes.concat([{
      method: 'GET',
      path: '/environments',
      config: {
        handler: this.index,
        auth: {
          strategy: 'session'
        }
      }
    }, {
      method: 'GET',
      path: '/environment/new',
      config: {
        handler: this.new,
        auth: {
          strategy: 'session'
        }
      }
    }]);

    this.routes = this.routes.concat([{
      method: 'POST',
      path: '/api/environment',
      config: {
        handler: this.createEnvironment,
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
  index(request, reply) {
    return Environment.findAsync()
      .then((environments) => {
        reply.view('environments/index', {
          title: 'Environments',
          environments: environments.map(environment => environment.toObject())
        });
      });
  }
  new(request, reply) {
    return reply.view('environments/new', {
      title: 'New Environment',
      environment: new Environment(),
      breadcrumbs: [{
        'name': 'Environments',
        'url': '/environments'
      }]
    });
  }
  createEnvironment(request, reply) {
    return Environment.count({
      name: request.payload.name
    }).then((count) => {
      if (count > 0) {
        throw Boom.conflict('an environment with that name already exists', {
          problem: 'Environment names must be unique',
          resolution: 'use a different environment name'
        });
      }
    }).then(function () {
      return new Environment({
        name: request.payload.name,
        fleetUrl: request.payload.fleetUrl
      }).saveAsync().spread((env) => {
        let response = reply(env.toObject());
        response.statusCode = 201;
      });
    });

  }
}

export default EnvironmentController;
