import * as ApplicationLogic from '../../../../src/server/logic/application';
import {_mongoose, Application} from '@hoist/model';
import config from 'config';
import {expect} from 'chai';
import path from 'path';

describe('ApplicationLogic', () => {
  /** @test {getApplicationPath} */
  describe('#getApplicationPath', () => {
    let appPath;
    before(() => {
      return appPath = _mongoose
        .connectAsync(config.get('Hoist.mongo.core.connectionString'))
        .then(() => {
          return Application.findOneAsync({_id: 'test-app'})
        })
        .then((application) => {
          return ApplicationLogic.getApplicationPath(application);
        });
    });
    after(() => {
      return _mongoose.disconnectAsync();
    });
    it('returns application real path', () => {
      return expect(appPath)
        .to
        .become(path.resolve(__dirname, '../../../fixtures/deploys/test-org/test-app/release'));
    });
  });
});
