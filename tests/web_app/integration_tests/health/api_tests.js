'use strict';
import configureServer from '../../../../lib/web_app/server';
import mongoose from 'mongoose';
import Bluebird from 'bluebird';
import config from 'config';
import {
  ServerHelper
}
from '../../../fixtures/helpers';
import {
  expect
}
from 'chai';

Bluebird.promisifyAll(mongoose);

describe('health api', () => {
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
  describe('GET /api/heartbeat', () => {
    let response;
    before(() => {
      return new Promise((resolve) => {
        server.inject({
          method: 'GET',
          url: `/api/heartbeat`
        }, (res) => {
          resolve(res);
        });
      }).then((res) => {
        response = res;
      });
    });
    it('returns [200|ok] response', () => {
      return expect(response.statusCode).to.eql(200);
    });
    it('returns results body', () => {
      return expect(response.result).to.eql({
        db: 'pass'
      });
    });
  });
});
