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
      method: ['GET', 'POST'],
      path: '/project/{project}/activate',
      config: {
        handler: this.activate,
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
    }, {
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
  index(request, reply) {
    reply.view('projects/index', {
      title: 'Projects'
    });
  }
  activate(request, reply) {
    if (request.method === 'get') {
      return Project.findOneAsync({
          name: request.params.project
        })
        .then((project) => {
          return reply.view('projects/activate', {
            project: project.toObject(),
            title: 'Activate',
            breadcrumbs: [{
              'name': 'Projects',
              'url': '/projects'
            }]
          });
        });
    } else {
      reply(404);
    }
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
    }).then((results) => {
      var projectBuildResults = results[1];
      var projectBuildResult = [].concat(projectBuildResults)[0];
      var response = reply(projectBuildResult);
      response.code(201);
    });
  }
  projects(request, reply) {
    return Project.findAsync({})
      .then(function (projects) {
        reply(projects.map((project) => {
          return project.toObject();
        }));
      });
  }
}


module.exports = ProjectsController;
