import * as EventLogic from '../../../../src/server/logic/event';
import settings from '../../../fixtures/test-application/hoist.json';
import {expect} from 'chai';
import setup from '../../../fixtures/setup';
describe("EventLogic", () => {
  /** @test {mapEventToModule} */
  describe("mapEventToModule", () => {
    let _result;
    before(() => {
      return EventLogic
        .mapEventToModule('test-event', {live: settings})
        .then((module) => {
          _result = module;
        });
    });
    it('returns correct module listing', () => {
      return expect(_result)
        .to
        .eql({name: 'test_module', src: './modules/test.js'})
    });
  });
});
