'use strict';
import ControllerBase from './controller_base';
import Environment from '../../models/environment';

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
      path: '/environment/{slug?}',
      config: {
        handler: this.edit,
        auth: {
          strategy: 'session'
        }
      }
    }]);
  }
  index(request, reply) {
    return Environment.findAsync()
      .then((environments) => {
        reply.view('environments/index', {
          title: 'Environments',
          environments: environments.map(environment => environment.toJSON())
        });
      });
  }
  edit(request, reply) {
    return Promise.resolve(() => {
      if (!request.params.slug || request.params.slug === 'new') {
        return new Environment();
      } else {
        return Environment.findOneAsync({
          slug: request.params.slug
        });
      }
    }()).then((environment) => {
      let title;
      let envObj = environment.toJSON();
      if (environment.isNew) {
        title = 'New Environment';
      } else {
        title = 'Edit Environment';
      }
      return reply.view('environments/edit', {
        title: title,
        environment: envObj,
        breadcrumbs: [{
          'name': 'Environments',
          'url': '/environments'
        }]
      });
    });

  }
}

export default EnvironmentController;
