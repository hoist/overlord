'use strict';
var util = require('util');
var ControllerBase = require('./controller_base');
var User = require('../../models/user');
var BBPromise = require('bluebird');

function SessionController() {
  ControllerBase.call(this);
  this.name = "Session";
  this.routes = this.routes.concat([{
    method: ['GET', 'POST'],
    path: '/session/create',
    config: {
      handler: this.create,
      auth: {
        mode: 'try',
        strategy: 'session'
      },
      plugins: {
        'hapi-auth-cookie': {
          redirectTo: false
        }
      },
      app: {
        reactable: true
      }
    }
  }, {
    method: ['GET'],
    path: '/session/destroy',
    config: {
      handler: this.destroy,
      auth: {
        strategy: 'session'
      },
      app: {
        reactable: true
      }
    }
  }]);
}

util.inherits(SessionController, ControllerBase);


SessionController.prototype.create = function (request, reply) {
  var errors;
  return BBPromise.try(function () {
      return;
    }, [], this)
    .bind(this)
    .then(function () {
      this.logger.info('in session create');
      if (request.auth.isAuthenticated) {
        this.logger.info('already authenticated');
        return;
      }
      if (request.method === 'post') {
        return BBPromise.try(function () {
            if ((!request.payload.username) || (request.payload.username.length < 1)) {
              this.logger.info('no username provided');
              errors = errors || {};
              errors.username = "username is required";
            }
            if ((!request.payload.password) || (request.payload.password.length < 1)) {
              this.logger.info('no password provided');
              errors = errors || {};
              errors.password = "password is required";
            }
          }, [], this)
          .bind(this)
          .then(function () {
            if (!errors) {
              return User.findOneAsync({
                  username: request.payload.username.toLowerCase()
                })
                .bind(this)
                .then(function (user) {
                  if (user) {
                    if (user.verifyPassword(request.payload.password)) {
                      this.logger.info('setting session user');
                      request.auth.session.set(user.toObject());
                      return;
                    } else {
                      this.logger.info('password incorrect');
                    }
                  } else {
                    this.logger.info('username incorrect');
                  }
                  errors = errors || {};
                  errors.global = 'username or password was incorrect';
                });
            }
          });
      }
    }).catch(function (err) {
      this.logger.error(err);
      errors = errors || {};
      errors.global = "something went wrong";
    }).finally(function () {
      this.logger.info('at end of request');
      console.log(request.auth);
      if (request.auth.isAuthenticated || request.auth.artifacts) {
        this.logger.info('redirecting to dashboard');
        return reply.redirect('/');
      } else {
        this.logger.info('serving up login page');
        return reply.view('session/create', {
          title: 'Log In',
          errors: errors
        }, {
          compileOptions: {
            layout: 'unauthenticated.hbs'
          }
        });
      }
    });



};

SessionController.prototype.destroy = function (request, reply) {
  request.auth.session.clear();
  return reply.redirect('/');
};

module.exports = SessionController;
