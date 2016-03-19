'use strict';
import ControllerBase from './controller_base';
import BBPromise from 'bluebird';
import Fleetctl from "fleetctl";
import Boom from 'boom';

const fleetctl = BBPromise.promisifyAll(new Fleetctl());


class ServersController extends ControllerBase {
  constructor() {
    super();
    this.name = "Servers";
    this.routes = this.routes.concat([{
      method: 'GET',
      path: '/servers',
      config: {
        handler: this.index,
        auth: {
          strategy: 'session'
        },
        app: {
          reactable: true
        }
      }

    }, {
      method: 'GET',
      path: '/api/servers',
      config: {
        handler: this.servers,
        auth: {
          mode: 'try',
          strategy: 'session'
        }
      }
    }]);
  }
  index(request, reply) {
    return reply.view('servers/index', {
      title: 'Servers'
    });
  }
  servers(request, reply) {
    this.logger.info('getting fleet stats');
    /* jshint camelcase: false */
    fleetctl.list_machinesAsync()
      .then((machines) => {
        reply(machines);
      }).catch((err) => {
        this.logger.error(err);
        return reply(Boom.wrap(err));
      });
  }
}
export default ServersController;
