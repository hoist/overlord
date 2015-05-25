'use strict';
var ControllerBase = require('./controller_base');
var Project = require('../../models/project');
var ProjectBuild = require('../../models/project_build');
class ProjectsController extends ControllerBase {
  constructor() {
    super();
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
  index(request, reply) {
    reply.view('projects/index', {
      title: 'Projects'
    });
  }
  registerBuild(request, reply) {
    return Project.findOneAsync({
      name: request.params.project
    }).then((project) => {
      return project || new Project({
        name: request.params.project,
        status: 'PENDING'
      });
    }).then((project) => {
      let projectBuild = new ProjectBuild({
        project: project,
        build: request.payload.build,
        sha1: request.payload.sha1,
        compareUrl: request.payload.compareUrl,
        author: request.auth.credentials._id
      });
      return Promise.all([project.saveAsync(), projectBuild.saveAsync()]);
    }).then(() => {
      reply(200);
    });

  }

}


module.exports = ProjectsController;
