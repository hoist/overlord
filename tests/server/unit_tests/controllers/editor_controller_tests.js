import sinon from 'sinon';
import {expect} from 'chai';
import {EditorController} from '../../../../src/server/areas/editor/editor_controller';
import {EditorLogic, ConnectorLogic} from '../../../../src/server/logic';
/** @test {EditorController} */
describe('EditorController', () => {
  let controller;
  before(() => {
    controller = new EditorController();
  });
  /** @test {ConnectorController#list} */
  describe('#state', () => {
    let connectors = [
      {
        key: 'connector-1',
        events: [
          {
            description: '',
            name: 'new:mention',
            connector: 'connector-1',
            key: 'connector-1:new:mention'
          }, {
            description: '',
            name: 'modified:mention',
            connector: 'connector-1',
            key: 'connector-1:modified:mention'
          }
        ]
      }, {
        key: 'connector-2',
        events: [
          {
            key: 'connector-2:new:thing',
            description: 'a new thing is created',
            name: 'new:thing',
            connector: 'connector-2'
          }
        ]
      }
    ]
    let request = {
      auth: {
        credentials: {
          application: {
            _id: 'applicationid',
            settings: {
              live: {
                on: {
                  'my:event': {},
                  "connector-2:new:thing": {}
                }
              }
            }
          }
        }
      }
    };
    let reply = sinon.stub();
    before(() => {
      sinon
        .stub(ConnectorLogic, 'getConnectorsForApplication')
        .returns(Promise.resolve(connectors));
      sinon
        .stub(EditorLogic, 'getCodeForEvent')
        .returns(Promise.resolve('this is some code'))
      return controller.state(request, reply);
    });
    it('returns list of current connectors and code', () => {
      return expect(reply)
        .to
        .have
        .been
        .calledWith(sinon.match({
          connectors,
          events: connectors[0]
            .events
            .concat(connectors[1].events)
            .concat({description: "", key: "my:event", name: "my:event"}),
          code: {
            event: 'connector-1:new:mention',
            script: 'this is some code'
          }
        }));
    });
    after(() => {
      ConnectorLogic
        .getConnectorsForApplication
        .restore();
      EditorLogic
        .getCodeForEvent
        .restore();
    });
  });
});
