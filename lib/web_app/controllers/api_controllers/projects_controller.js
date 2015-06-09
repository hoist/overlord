'use strict';
var ControllerBase = require('../controller_base');
var Project = require('../../../models/project');
class ProjectsController extends ControllerBase {
  constructor() {
    super();
    this.name = "Projects API";
    this.routes = this.routes.concat([{
      method: 'GET',
      path: '/api/projects',
      config: {
        handler: this.projects,
        auth: {
          strategy: 'session'
        }
      }
    }]);
  }
  projects(request, reply) {
    var query = {};
    return Project.findAsync(query)
      .then(function (projects) {
        reply(projects);
      });
  }
}


module.exports = ProjectsController;
