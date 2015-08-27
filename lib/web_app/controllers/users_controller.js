'use strict';
import ControllerBase from './controller_base';
import _ from 'lodash';
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
      path: '/user/{id}',
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
    var user;
    var organisations;
    var applications;
    return Models.HoistUser.findOneAsync({
        _id: request.params.id
      })
      .then((_user) => {
        user = _user;
        return Models.Organisation.findAsync({
          _id: {$in: user.organisations}
        });
      })
      .then((_organisations) => {
        organisations = _organisations;
        return Models.Application.findAsync({
          organisation: { $in:
            _.map(organisations, function(o) {
              return o._id;
            })
          }
        });
      })
      .then((_applications) => {
        applications = _applications;
        return reply.view('users/details', {
          user: user,
          rawUser: user,
          organisations: organisations,
          applications: applications,
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
