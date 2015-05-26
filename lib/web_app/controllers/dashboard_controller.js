'use strict';
import ControllerBase from './controller_base';

class DashboardController extends ControllerBase {
  constructor() {
    super();
    this.name = "Dashboard";
    this.routes = this.routes.concat([{
      method: 'GET',
      path: '/',
      config: {
        handler: this.index,
        auth: {
          strategy: 'session'
        },
        app: {
          reactable: true
        }
      }
    }]);
  }
  index(request, reply) {
    reply.view('dashboard/index', {
      title: 'Dashboard'
    });
  }
}

export default DashboardController;
