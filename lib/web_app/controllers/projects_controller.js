'use strict';
import ControllerBase from './controller_base';
import Project from '../../models/project';
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
      method: ['GET'],
      path: '/project/{id}',
      config: {
        handler: this.details,
        auth: {
          strategy: 'session'
        }
      }
    }, {
      method: ['GET'],
      path: '/project/{id}/activate',
      config: {
        handler: this.activate,
        auth: {
          strategy: 'session'
        }
      }
    }]);
  }
  index(request, reply) {
    return Project.findAsync({})
      .then((projects) => {
        reply.view('projects/index', {
          projects: projects,
          title: 'Projects'
        });
      });

  }
  activate(request, reply) {
    return Project.findOneAsync({
        _id: request.params.id
      })
      .then((project) => {
        if (project.status.toLowerCase() === 'active') {
          return reply.redirect(`/project/${project._id}`);
        } else {
          return reply.view('projects/activate', {
            project: project,
            title: 'Activate ' + project.name,
            breadcrumbs: [{
              'name': 'Projects',
              'url': '/projects'
            }]
          });
        }

      });
  }
  details(request, reply) {
    return Project.findOneAsync({
        _id: request.params.id
      })
      .then((project) => {
        if (project.status.toLowerCase() === 'pending') {
          return reply.redirect(`/project/${project._id}/activate`);
        } else {
          return reply.view('projects/details', {
            project: project,
            title: project.name,
            breadcrumbs: [{
              'name': 'Projects',
              'url': '/projects'
            }]
          });
        }

      });
  }
}


export default ProjectsController;
