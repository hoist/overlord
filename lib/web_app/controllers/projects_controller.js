'use strict';
var ControllerBase = require('./controller_base');
var Project = require('../../models/project');
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
      return Project.findOneAsync({
          name: request.params.project
        }).
      then((project)=>{
        if(!project){
          throw new Error();
        }
        if(!request.payload.unitText){
          throw new Error();
        }
        project.status = 'Active';
        project.unitText = request.payload.unitText;
        return project.saveAsync();
      }).then(()=>{
        return reply.redirect('/Projects');
      });
    }
  }
  projects(request, reply) {
    return Project.findAsync({
      status: request.query.status.toUpperCase()
    })
      .then(function (projects) {
        reply(projects.map((project) => {
          return project.toObject();
        }));
      });
  }
}


module.exports = ProjectsController;
