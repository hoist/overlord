'use strict';
import ControllerBase from './controller_base';
import {
  HoistUser, Organisation, Application
}
from '@hoist/model';
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
    }, {
      method: ['GET'],
      path: '/user/byid/',
      config: {
        handler: this.search,
        auth: {
          strategy: 'session'
        }
      }
    }]);
  }
  index(request, reply) {
    return HoistUser.findAsync({})
      .then((users) => {
        reply.view('users/index', {
          users: users,
          title: 'Users'
        });
      });

  }
  search(request, reply) {
    return HoistUser.findAsync({_id: request.query.id})
      .then((users) => {
        if(users.length === 0) {
          return Application.findAsync({_id: request.query.id})
            .then((applications) => {
              if(applications.length === 0) {
                return null;
              } else {
                return Organisation.findAsync({_id: applications[0].organisation})
                  .then((org) => {
                    if(org.length > 0) {
                      var orgIds = [];
                      orgIds.push(org[0]._id);
                      return HoistUser.findAsync({organisations: orgIds})
                        .then((user) => {
                          if(user.length > 0) {
                            return user[0];
                          } else {
                            return null;
                          }
                        });
                    } else {
                      return null;
                    }
                  });
              }
            });
        } else {
          return users[0];
        }
      })
      .then((user) => {
        reply.redirect('/user/' + user._id);
      });
  }
  details(request, reply) {
    var user;
    var organisations;
    var applications;
    return HoistUser.findOneAsync({
        _id: request.params.id
      })
      .then((_user) => {
        user = _user;
        return Organisation.findAsync({
          _id: {
            $in: user.organisations
          }
        });
      })
      .then((_organisations) => {
        organisations = _organisations;
        return Application.findAsync({
          organisation: {
            $in: organisations.map((o) => {
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
