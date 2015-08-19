'use strict';
import ControllerBase from './controller_base';
import Models from '@hoist/model';
class UsersController extends ControllerBase {
  constructor() {
    super();
    this.name = "Users";
    this.routes = this.routes.concat([{
      method: 'GET',
      path: '/users',
      config: {
        handler: this.index,
        auth: {
          strategy: 'session'
        }
      }
    }, {
      method: ['GET'],
      path: '/users/{id}',
      config: {
        handler: this.details,
        auth: {
          strategy: 'session'
        }
      }
    }]);
  }
  index(request, reply) {
    return Models.HoistUser.findAsync({})
      .then((users) => {
        reply.view('users/index', {
          users: users,
          title: 'Users'
        });
      });

  }
  details(request, reply) {
    return Models.HoistUser.findOneAsync({
        _id: request.params.id
      })
      .then((user) => {
        return reply.view('users/details', {
          user: user,
          title: user.name,
          breadcrumbs: [{
            'name': 'Users',
            'url': '/users'
          }]
        });
      });
  }
}


export default UsersController;
