'use strict';
import User from '../../lib/models/user';
import {
  expect
}
from 'chai';
export class ServerHelper {
  constructor(server) {
    this.server = server;
    this.testSecuredRoute = function (route) {
      return new Promise((resolve) => {
        server.inject({
          method: 'GET',
          url: route
        }, (res) => {
          resolve(res);
        });
      });
    };
    this.getAuthCookie = () => {
      return new Promise((resolve) => {
        this.server.inject({
          method: 'GET',
          url: '/TEST/login'
        }, (loginResponse) => {
          var header = loginResponse.headers['set-cookie'];
          var cookie = header[0].match(/(?:[^\x00-\x20\(\)<>@\,;\:\\"\/\[\]\?\=\{\}\x7F]+)\s*=\s*(?:([^\x00-\x20\"\,\;\\\x7F]*))/);
          resolve(cookie[0]);
        });
      });
    };
    this.setupTestUser = () => {
      return new User({
        name: 'unit test user',
        username: 'tests@hoist.io'
      }).saveAsync().spread((user) => {
        return user;
      }).then((testUser) => {
        this.server.route({
          method: 'GET',
          path: '/TEST/login',
          config: {
            auth: {
              mode: 'try',
              strategy: 'session'
            },
            plugins: {
              'hapi-auth-cookie': {
                redirectTo: false
              }
            },
            handler: function (request, reply) {
              request.auth.session.set({
                user: testUser
              });
              return reply(testUser);
            }
          }
        });
      });
    };
  }
  setup(server) {
    this.server = server;
  }
}
ServerHelper.isSecuredRoute = function () {
  it('returns [redirect|302] response', function () {
    return expect(this.response.statusCode).to.eql(302);
  });
  it('redirects to login page', function () {
    return expect(this.response.headers.location).to.eql('/session/create');
  });
};
