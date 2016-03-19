import * as EditorLogic from '../../../../src/server/logic/editor';
import * as ApplicationLogic from '../../../../src/server/logic/application';
import * as EventLogic from '../../../../src/server/logic/event';
import {Application} from '@hoist/model';
import sinon from 'sinon';
import {expect} from 'chai';
import path from 'path';
describe('EditorLogic', () => {
  describe('#getCodeForEvent', () => {
    let code;
    let application = {};
    let query = {
      populate: sinon
        .stub()
        .returnsThis(),
      exec: sinon
        .stub()
        .returns(Promise.resolve(application))
    }
    before(() => {
      let modulePath = path.resolve(__dirname, '../../../fixtures/test-application/');
      sinon
        .stub(Application, 'findOne')
        .returns(query);
      sinon
        .stub(EventLogic, 'mapEventToModule')
        .returns(Promise.resolve({name: 'module', src: 'module.js'}));
      sinon
        .stub(ApplicationLogic, 'getApplicationPath')
        .returns(Promise.resolve(modulePath));
      return code = EditorLogic.getCodeForEvent('app-id', 'eventName');
    });
    after(() => {
      Application
        .findOne
        .restore();
      EventLogic
        .mapEventToModule
        .restore();
      ApplicationLogic
        .getApplicationPath
        .restore();
    });
    it('should return code', () => {
      return expect(code)
        .to
        .eventually
        .eql(`module.exports = function () {}
`);
    });
  });
});
