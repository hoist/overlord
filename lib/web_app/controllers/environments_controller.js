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
      path: '/environment/{slug}',
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
          environments: environments.map(environment => environment.toObject())
        });
      });
  }
  edit(request, reply) {
    return reply.view('environments/new', {
      title: 'New Environment',
      environment: new Environment(),
      breadcrumbs: [{
        'name': 'Environments',
        'url': '/environments'
      }]
    });
  }
}

export default EnvironmentController;
