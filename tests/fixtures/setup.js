import {Models as OrganisationModels} from './models/organisations';
import {Models as ApplicationModels} from './models/applications';
import {_mongoose, Organisation, Application} from '@hoist/model';
import {closeConnection} from '../../src/server/utils/rabbit';
import config from 'config';
import Bluebird from 'bluebird';
export

function setupModels() {
  return Promise
    .resolve(_mongoose.connect(config.get('Hoist.mongo.core.connectionString')))
    .then(() => {
      return Promise.all(OrganisationModels.map((model) => new Organisation(model).saveAsync()))
    })
    .then(() => {
      return Promise.all(ApplicationModels.map((model) => new Application(model).saveAsync()))
    })
    .then(() => {
      return Bluebird.delay(1000);
    })
    .then(() => {
      _mongoose.disconnect();
    })
    .catch((err) => {
      console.log(err);
      try {
        _mongoose.disconnect();
      } catch (err) {}
    });
}
export

function tearDownModels() {
  return Promise
    .resolve(_mongoose.connect(config.get('Hoist.mongo.core.connectionString')))
    .then(() => {
      return Application.remove({
        _id: {
          $in: ApplicationModels.map((model) => model._id)
        }
      });
    })
    .then(() => {
      return Organisation.remove({
        _id: {
          $in: OrganisationModels.map((model) => model._id)
        }
      });
    })
    .then(() => {
      _mongoose.disconnect();
    })
    .catch((err) => {
      console.log(err);
      try {
        _mongoose.disconnect();
      } catch (err) {}
    });
}
before(function () {
  this.timeout(5000);
  console.log('setting up models');
  return setupModels();
});
after(() => {
  return tearDownModels().then(() => {
    console.log('closing connection to rabbit');
    return closeConnection();
  });
});
