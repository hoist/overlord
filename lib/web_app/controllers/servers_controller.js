'use strict';
import ControllerBase from './controller_base';
import BBPromise from 'bluebird';
import Fleetctl from "fleetctl";

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
          mode: 'try',
          strategy: 'session'
        }
      }
    }]);
  }

  index(request, reply) {
    let viewData = {};
    let errors;
    this.logger.info('getting fleet stats');
    /* jshint camelcase: false */
    fleetctl.list_machinesAsync()
      .then((machines) => {
        this.logger.info({
          machines: machines
        }, 'recieved ' + machines.length + ' machines');
        viewData.machines = machines;
      }).catch((err) => {
        this.logger.error(err);
        errors = errors || {};
        errors.global = "something went wrong";
      }).finally(() => {
        this.logger.info('at end of request');

        return reply.view('servers/index', {
          title: 'Servers',
          machines: viewData.machines,
          errors: errors
        });
      });
  }
}

module.exports = ServersController;
