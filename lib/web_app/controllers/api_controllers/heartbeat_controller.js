'use strict';
import ControllerBase from '../controller_base';
//import Boom from 'boom';
import mongoose from 'mongoose';

class HeartbeatController extends ControllerBase {
  constructor() {
    super();
    this.name = "Environments API";
    this.routes = this.routes.concat([{
      method: 'GET',
      path: '/api/heartbeat',
      config: {
        handler: this.heartbeat
      }
    }]);
  }
  heartbeat(request, reply) {
    return new Promise(function (resolve) {
      var ok = true;
      var result = {};
      if (mongoose.connection.readyState !== 1) {
        result.db = 'fail';
        ok = false;
      } else {
        result.db = 'pass';
      }
      if (ok) {
        reply(result);
      } else {
        var response = reply(result);
        response.statusCode = 500;
      }
      resolve();
    });
  }
}

export default HeartbeatController;

