'use strict';
var util = require('util');
var BaseController = require('./base_controller');

function DashboardController() {
  BaseController.call(this);
  this.routes = this.routes.concat([{
    method: 'GET',
    path: '/',
    handler: this.index
  }]);
}

util.inherits(DashboardController, BaseController);


DashboardController.prototype.index = function (request, reply) {
  reply.view('dashboard/index');
};


module.exports = DashboardController;
