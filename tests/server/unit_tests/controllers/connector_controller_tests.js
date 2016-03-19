import sinon from 'sinon';
import {expect} from 'chai';
import {ConnectorSetting} from '@hoist/model';
import {ConnectorController} from '../../../../src/server/areas/connector/connector_controller';
import {ConnectorLogic} from '../../../../src/server/logic';
import nock from 'nock';
import url from 'url';
/** @test {ConnectorController} */
describe('ConnectorController', () => {
  let controller;
  before(() => {
    controller = new ConnectorController();
  });
  /** @test {ConnectorController#list} */
  describe('#list', () => {
    let connectors = [
      {
        connectorType: 'test-connector',
        key: 'connector-1'
      }, {
        connectorType: 'test-connector2',
        key: 'connector-2'
      }
    ]
    let request = {
      auth: {
        credentials: {
          application: 'applicationid'
        }
      }
    };
    let reply = sinon.stub();
    before(() => {
      sinon
        .stub(ConnectorSetting, 'findAsync')
        .returns(connectors);
      return controller.list(request, reply);
    });
    it('returns list of orgs current connectors', () => {
      return expect(reply)
        .to
        .have
        .been
        .calledWith([
          sinon.match({
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
          }),
          sinon.match({
            key: 'connector-2',
            events: [
              {
                description: 'a new thing is created',
                name: 'new:thing',
                connector: 'connector-2',
                key: 'connector-2:new:thing'
              }
            ]
          })
        ]);
    });
    it('loads up connectors based on current application', () => {
      return expect(ConnectorSetting.findAsync)
        .to
        .have
        .been
        .calledWith({application: 'applicationid'});
    })
    after(() => {
      ConnectorSetting
        .findAsync
        .restore();
    });
  });
  describe('#getAvailable', () => {});
  describe('#getTriggers', () => {});
  describe('#connect', () => {
    let request = {
      auth: {
        credentials: {
          application: {
            slug: 'appslug'
          },
          organisation: {
            slug: 'orgslug'
          }
        }
      },
      payload: {
        connectorType: 'test-connector'
      }
    };
    let reply = sinon.stub();

    let bouncerRequest;
    before(() => {
      sinon
        .stub(ConnectorLogic, 'setupDefaultConnector')
        .returns(Promise.resolve({key: 'connector-key'}));
      nock('http://bouncer.hoist.test')
        .get('/initiate/orgslug/appslug/connector-key')
        .query(true)
        .reply(302, function (uri, requestBody) {
          bouncerRequest = url.parse(uri, true);
          return ""
        }, {'Location': 'http://auth-portal.test'});
      return controller.connect(request, reply);
    });
    after(() => {
      ConnectorLogic
        .setupDefaultConnector
        .restore();
      nock.restore();
    })
    it('should return redirect url', () => {
      return expect(reply)
        .to
        .have
        .been
        .calledWith({uri: 'http://auth-portal.test'})
    });
    it('should request the correct bucket key to bouncer', () => {
      return expect(bouncerRequest.query.bucketKey)
        .to
        .eql('default');
    });
    it('should pass correct return url to bouncer', () => {
      return expect(bouncerRequest.query.returnUrl)
        .to
        .eql('http://portal.hoist.test/orgslug/appslug/connector/connector-key')
    });
  });
});
