'use strict';
import ControllerBase from './controller_base';

class WebhooksController extends ControllerBase {
  constructor() {
    super();
    this.name = "Webhooks";
    this.routes = this.routes.concat([{
      method: 'POST',
      path: '/api/webhook/{provider}',
      config: {
        handler: this.receive,
        auth: {
          strategy: 'token'
        }
      }
    }]);
  }
  receive(request, reply) {
    var provider = require('./webhooks/' + request.params.provider);
    return provider.process(request, reply);
  }
}


export default WebhooksController;
