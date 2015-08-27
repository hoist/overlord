'use strict';
import configureServer from '../../../../lib/web_app/server';
import connectionManager from '../../../../lib/models/connection_manager';
import Bluebird from 'bluebird';
import config from 'config';
import Project from '../../../../lib/models/project';
import {
  ServerHelper
}
from '../../../fixtures/helpers';
import cheerio from 'cheerio';
import {
  expect
}
from 'chai';



describe('project view routes', () => {
  let server;
  let serverHelper;
  let existingActiveProject;
  let existingPendingProject;
  before(() => {
    return Promise.all([
      connectionManager.connect(config.get('Hoist.mongo.overlord')),
      new Project({
        name: 'pending project',
        status: 'PENDING',
        vcs: {
          repository: 'repo',
          username: 'username'
        }
      }).saveAsync().spread((project) => {
        existingPendingProject = project;
      }),
      new Project({
        name: 'active project',
        status: 'ACTIVE',
        vcs: {
          repository: 'repo',
          username: 'username'
        }
      }).saveAsync().spread((project) => {
        existingActiveProject = project;
      }),
      configureServer().then((s) => {
        server = Bluebird.promisifyAll(s);
        serverHelper = new ServerHelper(server);
      }).then(() => {
        return serverHelper.setupTestUser();
      })
    ]);
  });
  after(() => {
    return Bluebird.promisify(connectionManager.connection.db.dropDatabase, connectionManager.connection.db)()
      .then(() => {
        return connectionManager.disconnect();
      });
  });


  describe('GET /projects', () => {
    describe('if not logged in', () => {
      before(function () {
        serverHelper.testSecuredRoute('/projects').then((res) => {
          this.response = res;
        });
      });
      ServerHelper.isSecuredRoute();
    });
    describe('if logged in', () => {
      let response;
      let $;
      before(() => {
        return serverHelper.getAuthCookie().then((cookie) => {
          return new Promise((resolve) => {
            server.inject({
              method: 'GET',
              url: `/projects`,
              headers: {
                cookie: cookie
              }
            }, (res) => {
              resolve(res);
            });
          });
        }).then((res) => {
          response = res;
          $ = cheerio.load(response.payload);
        });
      });
      it('returns project list view', () => {
        return expect($('title').text()).to.eql('Projects');
      });
      it('displays activate button for pending projects', () => {
        return expect($('#project-row-' + existingPendingProject._id + ' button').first().text()).to.eql('Activate');
      });
      it('displays view button for active projects', () => {
        return expect($('#project-row-' + existingActiveProject._id + ' button').first().text()).to.eql('View');
      });
    });
  });
  describe('GET /project/{id}', () => {
    describe('if not logged in', () => {
      before(function () {
        serverHelper.testSecuredRoute(`/project/{existingActiveProject._id}`).then((res) => {
          this.response = res;
        });
      });
      ServerHelper.isSecuredRoute();
    });
    describe('with pending project', () => {
      let response;
      before(() => {
        return serverHelper.getAuthCookie().then((cookie) => {
          return new Promise((resolve) => {
            server.inject({
              method: 'GET',
              url: `/project/${existingPendingProject._id}`,
              headers: {
                cookie: cookie
              }
            }, (res) => {
              resolve(res);
            });
          });
        }).then((res) => {
          response = res;
        });
      });
      it('responds with a [redirect|302] response', () => {
        return expect(response.statusCode).to.eql(302);
      });
      it('redirects to activate page', () => {
        return expect(response.headers.location).to.eql(`/project/${existingPendingProject._id}/activate`);
      });
    });
    describe('with active project', () => {
      let response;
      let $;
      before(() => {
        return serverHelper.getAuthCookie().then((cookie) => {
          return new Promise((resolve) => {
            server.inject({
              method: 'GET',
              url: `/project/${existingActiveProject._id}`,
              headers: {
                cookie: cookie
              }
            }, (res) => {
              resolve(res);
            });
          });
        }).then((res) => {
          response = res;
          $ = cheerio.load(response.payload);
        });
      });
      it('responds with an [ok|200] response', () => {
        return expect(response.statusCode).to.eql(200);
      });
      it('returns project details page', () => {
        return expect($('title').text()).to.eql(existingActiveProject.name);
      });
    });
  });
  describe('GET /project/{id}/activate', () => {
    describe('if not logged in', () => {
      before(function () {
        serverHelper.testSecuredRoute(`/project/{existingActiveProject._id}/activate`).then((res) => {
          this.response = res;
        });
      });
      ServerHelper.isSecuredRoute();
    });
    describe('with active project', () => {
      let response;
      before(() => {
        return serverHelper.getAuthCookie().then((cookie) => {
          return new Promise((resolve) => {
            server.inject({
              method: 'GET',
              url: `/project/${existingActiveProject._id}/activate`,
              headers: {
                cookie: cookie
              }
            }, (res) => {
              resolve(res);
            });
          });
        }).then((res) => {
          response = res;
        });
      });
      it('responds with a [redirect|302] response', () => {
        return expect(response.statusCode).to.eql(302);
      });
      it('redirects to details page', () => {
        return expect(response.headers.location).to.eql(`/project/${existingActiveProject._id}`);
      });
    });
    describe('with pending project', () => {
      let response;
      let $;
      before(() => {
        return serverHelper.getAuthCookie().then((cookie) => {
          return new Promise((resolve) => {
            server.inject({
              method: 'GET',
              url: `/project/${existingPendingProject._id}/activate`,
              headers: {
                cookie: cookie
              }
            }, (res) => {
              resolve(res);
            });
          });
        }).then((res) => {
          response = res;
          $ = cheerio.load(response.payload);
        });
      });
      it('responds with an [ok|200] response', () => {
        return expect(response.statusCode).to.eql(200);
      });
      it('loads the activate page', () => {
        return expect($('title').text()).to.eql('Activate ' + existingPendingProject.name);
      });
      it('has a name field', () => {
        return expect($('input[id="name"]').val()).to.eql(existingPendingProject.name);
      });
      it('has a repository username field', () => {
        return expect($('input[id="vcs.username"]').val()).to.eql(existingPendingProject.vcs.username);
      });
      it('has a repository name field', () => {
        return expect($('input[id="vcs.repository"]').val()).to.eql(existingPendingProject.vcs.repository);
      });
      it('has an activate button', () => {
        return expect($('button[type="submit"]').text()).to.eql('Activate');
      });
    });
  });
});
