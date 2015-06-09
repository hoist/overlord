'use strict';
import configureServer from '../../../../lib/web_app/server';
import mongoose from 'mongoose';
import Bluebird from 'bluebird';
import config from 'config';
import Project from '../../../../lib/models/project';
import {
  ServerHelper
}
from '../../../fixtures/helpers';
import {
  expect
}
from 'chai';

Bluebird.promisifyAll(mongoose);
describe('project api', () => {
  let server;
  let serverHelper;
  before(() => {
    return Promise.all([
      mongoose.connectAsync(config.get('Hoist.mongo.overlord')),
      configureServer().then((s) => {
        server = Bluebird.promisifyAll(s);
        serverHelper = new ServerHelper(s);
      }).then(() => {
        return serverHelper.setupTestUser();
      })
    ]);
  });
  after(() => {
    return Bluebird.promisify(mongoose.connection.db.dropDatabase, mongoose.connection.db)()
      .then(() => {
        return mongoose.disconnectAsync();
      });
  });
  describe('PUT /api/project/{id}', () => {
    let existingProject;
    let testPayload = {
      name: 'updated name',
      vcs: {
        username: 'updated username',
        repository: 'updated repo'
      }
    };
    before(() => {
      return new Project({
        name: 'existing name',
        status: 'PENDING',
        vcs: {
          username: 'existing username',
          repository: 'existing repository'
        }
      }).saveAsync().spread((project) => {
        existingProject = project;
      });
    });
    after(() => {
      return Project.removeAsync({});
    });
    describe('if not logged in', () => {
      let response;
      before(() => {
        return new Promise((resolve) => {
          server.inject({
            method: 'PUT',
            url: `/api/project/${existingProject.id}`,
            payload: testPayload
          }, (res) => {
            resolve(res);
          });
        }).then((res) => {
          response = res;
        });
      });
      it('returns an [unauthorised|401] response', () => {
        return expect(response.statusCode).to.eql(401);
      });
    });
    describe('if project does not exist', () => {
      let response;
      before(() => {
        return serverHelper.getAuthCookie().then((cookie) => {
          return new Promise((resolve) => {
            server.inject({
              method: 'PUT',
              url: `/api/project/${new mongoose.Types.ObjectId()}`,
              payload: testPayload,
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
      it('returns a [not found|404] response', () => {
        return expect(response.statusCode).to.eql(404);
      });
    });
    describe('if payload is valid', () => {
      let response;
      before(() => {
        return serverHelper.getAuthCookie().then((cookie) => {
          return new Promise((resolve) => {
            server.inject({
              method: 'PUT',
              url: `/api/project/${existingProject._id}`,
              payload: testPayload,
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
      after(() => {
        return Project.findOneAsync({
            _id: existingProject._id
          })
          .then((project) => {
            project.name = existingProject.name;
            project.vcs.username = existingProject.vcs.username;
            project.vcs.repository = existingProject.vcs.repository;
            project.status = 'PENDING';
            return project.saveAsync().spread((p) => {
              existingProject = p;
            });
          });
      });
      it('returns an [ok|200] response', () => {
        return expect(response.statusCode).to.eql(200);
      });
      it('sets project as active', () => {
        return Project.findOneAsync({
            _id: existingProject._id
          })
          .then((project) => {
            return expect(project.status).to.eql('ACTIVE');
          });
      });
      it('updates project name', () => {
        return Project.findOneAsync({
            _id: existingProject._id
          })
          .then((project) => {
            return expect(project.name).to.eql(testPayload.name);
          });
      });
      it('updates project vcs settings', () => {
        return Project.findOneAsync({
            _id: existingProject._id
          })
          .then((project) => {
            return expect(project.vcs.username).to.eql(testPayload.vcs.username) &&
              expect(project.vcs.repository).to.eql(testPayload.vcs.repository);
          });
      });
      it('returns updated project', () => {
        return Project.findOneAsync({
            _id: existingProject._id
          })
          .then((project) => {
            return expect(response.payload).to.eql(JSON.stringify(project));
          });
      });
    });
    describe('if name is missing', () => {
      let response;
      let originalName;
      before(() => {
        originalName = testPayload.name;
        delete testPayload.name;
        return serverHelper.getAuthCookie().then((cookie) => {
          return new Promise((resolve) => {
            server.inject({
              method: 'PUT',
              url: `/api/project/${existingProject._id}`,
              payload: testPayload,
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
      after(() => {
        testPayload.name = originalName;
      });
      it('returns an [bad request|400] response', () => {
        return expect(response.statusCode).to.eql(400);
      });
      it('doesnt update project', () => {
        return Project.findOneAsync({
            _id: existingProject._id
          })
          .then((project) => {
            return expect(project.toJSON()).to.eql(existingProject.toJSON());
          });
      });
      it('returns an error body', () => {
        return expect(response.result).to.exist;
      });
      it('returns an error message saying name is required', () => {
        return expect(response.result.errors.name.message).to.eql('name is required');
      });
    });
    describe('if vcs repository is missing', () => {
      let response;
      let originalRepository;
      before(() => {
        originalRepository = testPayload.vcs.repository;
        delete testPayload.vcs.repository;
        return serverHelper.getAuthCookie().then((cookie) => {
          return new Promise((resolve) => {
            server.inject({
              method: 'PUT',
              url: `/api/project/${existingProject._id}`,
              payload: testPayload,
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
      after(() => {
        testPayload.vcs.repository = originalRepository;
      });
      it('returns an [bad request|400] response', () => {
        return expect(response.statusCode).to.eql(400);
      });
      it('doesnt update project', () => {
        return Project.findOneAsync({
            _id: existingProject._id
          })
          .then((project) => {
            return expect(project.toJSON()).to.eql(existingProject.toJSON());
          });
      });
      it('returns an error body', () => {
        return expect(response.result).to.exist;
      });
      it('returns an error message saying repository is required', () => {
        return expect(response.result.errors['vcs.repository'].message).to.eql('VCS Repository is required');
      });
    });
    describe('if vcs username is missing', () => {
      let response;
      let originalUsername;
      before(() => {
        originalUsername = testPayload.vcs.username;
        delete testPayload.vcs.username;
        return serverHelper.getAuthCookie().then((cookie) => {
          return new Promise((resolve) => {
            server.inject({
              method: 'PUT',
              url: `/api/project/${existingProject._id}`,
              payload: testPayload,
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
      after(() => {
        testPayload.vcs.username = originalUsername;
      });
      it('returns an [bad request|400] response', () => {
        return expect(response.statusCode).to.eql(400);
      });
      it('doesnt update project', () => {
        return Project.findOneAsync({
            _id: existingProject._id
          })
          .then((project) => {
            return expect(project.toJSON()).to.eql(existingProject.toJSON());
          });
      });
      it('returns an error body', () => {
        return expect(response.result).to.exist;
      });
      it('returns an error message saying repository is required', () => {
        return expect(response.result.errors['vcs.username'].message).to.eql('VCS Username is required');
      });
    });
  });
});
