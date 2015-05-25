'use strict';
var util = require('util');
var ControllerBase = require('./controller_base');

function ProjectsController() {
  ControllerBase.call(this);
  this.name = "Projects";
  this.routes = this.routes.concat([{
    method: 'GET',
    path: '/projects',
    config: {
      handler: this.index,
      auth: {
        strategy: 'session'
      }
    }
  }, {
    method: 'POST',
    path: '/api/build/{project}',
    config: {
      handler: this.registerBuild,
      auth: {
        strategy: 'token'
      }
    }
  }]);
}

util.inherits(ProjectsController, ControllerBase);


ProjectsController.prototype.index = function (request, reply) {
  reply.view('projects/index', {
    title: 'Projects'
  });
};
ProjectsController.prototype.registerBuild = function () {

};


module.exports = ProjectsController;
