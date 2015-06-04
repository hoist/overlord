'use strict';
import configureServer from '../../../../lib/web_app/server';
import mongoose from 'mongoose';
import Bluebird from 'bluebird';
import config from 'config';
import Environment from '../../../../lib/models/environment';
import {
  ServerHelper
}
from '../../../fixtures/helpers';
import cheerio from 'cheerio';
import {
  expect
}
from 'chai';
Bluebird.promisifyAll(mongoose);
describe('environment view routes', () => {
  let server;
  let serverHelper;
  let existingEnvironment;
  before(() => {
    return Promise.all([
      mongoose.connectAsync(config.get('Hoist.mongo.overlord')),
      new Environment({
        name: 'test existing environment',
        fleetUrl: 'http://fleet.hoist.test'
      }).saveAsync().spread((environment) => {
        existingEnvironment = environment;
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
    return Bluebird.promisify(mongoose.connection.db.dropDatabase, mongoose.connection.db)()
      .then(() => {
        return mongoose.disconnectAsync();
      });
  });
  describe('GET /environment', () => {
    describe('if logged in', () => {
      let response;
      let $;
      before(() => {
        return serverHelper.getAuthCookie().then((cookie) => {
          return new Promise((resolve) => {
            server.inject({
              method: 'GET',
              url: `/environment`,
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
      it('serves up new environment page', () => {
        return expect($('title').text()).to.eql('Environments => New Environment');
      });
      it('populates form with defaults', () => {
        return expect($('#name').val()).to.not.exist &&
          expect($('#fleetUrl').val()).to.not.exist &&
          expect($('#slug').val()).to.not.exist &&
          expect($('#isNew').val()).to.eql('true');
      });
    });
    describe('if not logged in', () => {
      before(function () {
        serverHelper.testSecuredRoute('/environment').then((res) => {
          this.response = res;
        });
      });
      ServerHelper.isSecuredRoute();
    });
  });
  describe('GET /environment/{slug}', () => {
    describe('if logged in', () => {
      describe('if environment exists', () => {
        let response;
        let $;
        before(() => {
          return serverHelper.getAuthCookie().then((cookie) => {
            return new Promise((resolve) => {
              server.inject({
                method: 'GET',
                url: `/environment/${existingEnvironment.slug}`,
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
        it('serves up edit page', () => {
          return expect($('title').text()).to.eql('Environments => Edit');
        });
        it('populates form', () => {
          return expect($('#name').val()).to.eql(existingEnvironment.name) &&
            expect($('#fleetUrl').val()).to.eql(existingEnvironment.fleetUrl) &&
            expect($('#_id').val()).to.eql(existingEnvironment._id.toString()) &&
            expect($('#slug').val()).to.eql(existingEnvironment.slug) &&
            expect($('#isNew').val()).to.eql('false');
        });
      });
    });
    describe('if not logged in', () => {
      before(function () {
        serverHelper.testSecuredRoute(`/environment/${existingEnvironment.slug}`).then((res) => {
          this.response = res;
        });
      });
      ServerHelper.isSecuredRoute();
    });
  });
  describe('GET /environments', () => {
    describe('if logged in', () => {
      let response;
      before(() => {
        return serverHelper.getAuthCookie().then((cookie) => {
          return new Promise((resolve) => {
            server.inject({
              method: 'GET',
              url: `/environments`,
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
      it('returns view', () => {
        let $ = cheerio.load(response.payload);
        return expect($('title').text()).to.eql('Environments');
      });
      it('returns [ok|200] response', () => {
        return expect(response.statusCode).to.eql(200);
      });
    });
    describe('if not logged in', () => {
      before(function () {
        serverHelper.testSecuredRoute('/environments').then((res) => {
          this.response = res;
        });
      });
      ServerHelper.isSecuredRoute();
    });
  });
});
