'use strict';
import configureServer from '../../../../lib/web_app/server';
import Environment from '../../../../lib/models/environment';
import mongoose from 'mongoose';
import Bluebird from 'bluebird';
import config from 'config';
import {ServerHelper} from '../../../fixtures/helpers';
import {
  expect
}
from 'chai';
Bluebird.promisifyAll(mongoose);
describe('environment api', () => {
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
  describe('POST /api/environment', () => {
    let testPayload = {
      name: 'test environment',
      fleetUrl: 'http://testfleeturl.com'
    };
    describe('if not logged in', () => {
      let response;
      before(() => {
        return new Promise((resolve) => {
          server.inject({
            method: 'POST',
            url: `/api/environment`,
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
    describe('with valid payload', () => {
      let response;
      before(() => {
        return serverHelper.getAuthCookie().then((cookie) => {
          return new Promise((resolve) => {
            server.inject({
              method: 'POST',
              url: `/api/environment`,
              payload: testPayload,
              headers: {
                cookie: cookie
              }
            }, (res) => {
              resolve(res);
            });
          }).then((res) => {
            response = res;
          });
        });
      });
      after(() => {
        return Environment.removeAsync({});
      });
      it('returns a [created|201] response', () => {
        return expect(response.statusCode).to.eql(201);
      });
      it('creates the environment', () => {
        return Environment.countAsync()
          .then((count) => {
            return expect(count).to.eql(1);
          });
      });
    });
    describe('with an existing name', () => {
      let response;
      before(() => {
        return new Environment({
          name: 'test environment',
          fleetUrl: 'http://test.hoist.io/fleet'
        }).saveAsync().then(() => {
          return serverHelper.getAuthCookie().then((cookie) => {
            return new Promise((resolve) => {
              server.inject({
                method: 'POST',
                url: `/api/environment`,
                payload: testPayload,
                headers: {
                  cookie: cookie
                }
              }, (res) => {
                resolve(res);
              });
            }).then((res) => {
              response = res;
            });
          });
        });
      });
      after(() => {
        return Environment.removeAsync({});
      });
      it('returns a [conflict|409] response', () => {
        return expect(response.statusCode).to.eql(409);
      });
      it('does not create a new enivrionment', () => {
        return Environment.countAsync()
          .then((count) => {
            return expect(count).to.eql(1);
          });
      });
      it('returns an error body', () => {
        return expect(response.result).to.exist;
      });
      it('returns an error message saying name must be unique', () => {
        return expect(response.result.message).to.eql('an environment with that name already exists');
      });
    });
    describe('with no name', () => {
      let response;
      let originalName;
      before(() => {
        originalName = testPayload.name;
        delete testPayload.name;
        return serverHelper.getAuthCookie().then((cookie) => {
          return new Promise((resolve) => {
            server.inject({
              method: 'POST',
              url: `/api/environment`,
              payload: testPayload,
              headers: {
                cookie: cookie
              }
            }, (res) => {
              resolve(res);
            });
          }).then((res) => {
            response = res;
          });
        });
      });
      after(() => {
        testPayload.name = originalName;
        return Environment.removeAsync({});
      });
      it('returns a [bad request|400] response', () => {
        return expect(response.statusCode).to.eql(400);
      });
      it('does not create a new enivrionment', () => {
        return Environment.countAsync()
          .then((count) => {
            return expect(count).to.eql(0);
          });
      });
      it('returns an error body', () => {
        return expect(response.result).to.exist;
      });
      it('returns an error message saying name is required', () => {
        return expect(response.result.errors.name.message).to.eql('name is required');
      });
    });
    describe('with no fleet url', () => {
      let response;
      let originalUrl;
      before(() => {
        originalUrl = testPayload.fleetUrl;
        delete testPayload.fleetUrl;
        return serverHelper.getAuthCookie().then((cookie) => {
          return new Promise((resolve) => {
            server.inject({
              method: 'POST',
              url: `/api/environment`,
              payload: testPayload,
              headers: {
                cookie: cookie
              }
            }, (res) => {
              resolve(res);
            });
          }).then((res) => {
            response = res;
          });
        });
      });
      after(() => {
        testPayload.fleetUrl = originalUrl;
        return Environment.removeAsync({});
      });
      it('returns a [bad request|400] response', () => {
        return expect(response.statusCode).to.eql(400);
      });
      it('does not create a new enivrionment', () => {
        return Environment.countAsync()
          .then((count) => {
            return expect(count).to.eql(0);
          });
      });
      it('returns an error body', () => {
        return expect(response.result).to.exist;
      });
      it('returns an error message saying fleet url is required', () => {
        return expect(response.result.errors.fleetUrl.message).to.eql('fleet url is required');
      });
    });
  });
});
