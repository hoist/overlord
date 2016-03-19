import {ConnectorSetting} from '@hoist/model';
import {ConnectorLogic} from '../../../../src/server/logic';
import sinon from 'sinon';
import {expect} from 'chai';
import config from 'config';
describe('ConnectorLogic', () => {
  describe('#setupDefaultConnector', () => {
    before(() => {});
    describe('if no connector exists', () => {
      let connector;
      let expectedConnector = {
        expected: true
      };
      let rootConnector = {
        name: 'test connector',
        connectorType: 'hoist-connector-test',
        settings: {
          one: 1,
          two: 2
        },
        defaultKey: 'test'
      };
      let connectorType = 'connectorType';
      let application = {
        _id: 'appid'
      };
      before(() => {
        sinon
          .stub(ConnectorSetting.prototype, 'saveAsync')
          .returns(Promise.resolve(expectedConnector))
        sinon
          .stub(ConnectorSetting, 'findOneAsync')
          .returns(Promise.resolve(rootConnector));
        sinon
          .stub(ConnectorSetting, 'countAsync')
          .returns(Promise.resolve(0));
        return (connector = ConnectorLogic.setupDefaultConnector(application, connectorType));
      });
      after(() => {
        ConnectorSetting
          .prototype
          .saveAsync
          .restore();
        ConnectorSetting
          .findOneAsync
          .restore();
        ConnectorSetting
          .countAsync
          .restore();
      })
      it('should save a new connector', () => {
        return expect(ConnectorSetting.prototype.saveAsync)
          .to
          .have
          .been
          .calledOn(sinon.match((connector) => {
            return expect(connector.key)
              .to
              .eql('test') && expect(connector.application)
              .to
              .eql('appid') && expect(connector.settings.one)
              .to
              .eql(1);
          }));
      });
      it('should return saved connector', () => {
        return expect(connector)
          .to
          .become(expectedConnector)
      });
      it('should look up root connector', () => {
        return expect(ConnectorSetting.findOneAsync)
          .to
          .have
          .been
          .calledWith({
            key: "hoist-root-" + connectorType,
            application: config.get('Hoist.admin.applicationId')
          });
      });
    });
    describe('if default connector key already exists', () => {
      let connector;
      let expectedConnector = {
        expected: true
      };
      let rootConnector = {
        name: 'test connector',
        connectorType: 'hoist-connector-test',
        settings: {
          one: 1,
          two: 2
        },
        defaultKey: 'test'
      };
      let connectorType = 'connectorType';
      let application = {
        _id: 'appid'
      };
      before(() => {
        sinon
          .stub(ConnectorSetting.prototype, 'saveAsync')
          .returns(Promise.resolve(expectedConnector))
        sinon
          .stub(ConnectorSetting, 'findOneAsync')
          .returns(Promise.resolve(rootConnector));
        sinon
          .stub(ConnectorSetting, 'countAsync')
          .onCall(0)
          .returns(Promise.resolve(1));
        ConnectorSetting
          .countAsync
          .returns(Promise.resolve(0));
        return (connector = ConnectorLogic.setupDefaultConnector(application, connectorType));
      });
      it('should append a random number to key', () => {
        return expect(ConnectorSetting.prototype.saveAsync)
          .to
          .have
          .been
          .calledOn(sinon.match((connector) => {
            return expect(connector.key)
              .to
              .match(/^test[0-9]{1,4}/);
          }));
      });
    });
  });
})
