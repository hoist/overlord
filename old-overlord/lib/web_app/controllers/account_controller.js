'use strict';
import ControllerBase from './controller_base';
import User from '../../models/user';
class DashboardController extends ControllerBase {
  constructor() {
    super();
    this.name = "Dashboard";
    this.routes = this.routes.concat([{
      method: ['GET', 'POST'],
      path: '/account/create',
      config: {
        handler: this.create,
        auth: {
          strategy: 'session',
          mode: 'try'
        },
        plugins: {
          'hapi-auth-cookie': {
            redirectTo: false
          }
        }
      }
    }]);
  }
  create(request, reply) {
    let errors;
    let redirect;
    return Promise.resolve()
      .then(() => {
        if (request.auth.isAuthenticated) {
          redirect = '/';
        }
        if (request.method === 'post') {
          if (!request.payload.email) {
            errors = errors || {};
            errors.email = "email is required";
          } else if (!request.payload.email.toLowerCase().endsWith('@hoist.io')) {
            errors = errors || {};
            errors.email = "you must sign up with your hoist.io email address";
          } else {
            //try and find an existing user
            return User.findOne({
              username: request.payload.email
            }).then((user) => {
              user = user || new User({
                username: request.payload.email
              });
              return user;
            }).then((user) => {
              this.sendActivation(user);
            });
          }
        }
      }).then(() => {
        if (redirect) {
          return reply.redirect(redirect);
        } else {
          return reply.view('account/create', {
            title: 'Create an Account',
            errors: errors
          }, {
            compileOptions: {
              layout: 'unauthenticated.hbs'
            }
          });
        }
      });

  }
}

export default DashboardController;
