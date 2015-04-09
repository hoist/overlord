'use strict';
var util = require('util');
var ControllerBase = require('./controller_base');

function DashboardController() {
  ControllerBase.call(this);
  this.name = "Dashboard";
  this.routes = this.routes.concat([{
    method: 'GET',
    path: '/',
    handler: this.index
  }]);
}

util.inherits(DashboardController, ControllerBase);


DashboardController.prototype.index = function (request, reply) {
  reply.view('dashboard/index', {
    title: 'Dashboard'
  });
};


module.exports = DashboardController;
