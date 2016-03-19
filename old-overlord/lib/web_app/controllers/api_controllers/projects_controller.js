'use strict';
import ControllerBase from '../controller_base';
import Project from '../../../models/project';
import Boom from 'boom';

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
    }, {
      method: 'PUT',
      path: '/api/project/{id}',
      config: {
        handler: this.updateProject,
        auth: {
          strategy: 'session'
        },
        plugins: {
          'hapi-auth-cookie': {
            redirectTo: false
          }
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
  updateProject(request, reply) {
    return Project.findOneAsync({
      _id: request.params.id
    }).then((project) => {
      if (!project) {
        throw Boom.notFound('no environment with that slug found');
      }
      project.name = request.payload.name;
      project.vcs.repository = request.payload.vcs.repository;
      project.vcs.username = request.payload.vcs.username;
      project.status = 'ACTIVE';
      return project.saveAsync().spread((p) => {
        return p;
      });
    }).then((project) => {
      reply(project);
    });
  }
}


export default ProjectsController;
