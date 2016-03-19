import {_mongoose} from '@hoist/model';
import PortalServer from '../../../src/server';
import configurators from '../../../src/server/configuration';
import {Server as HapiServer} from 'hapi';
import sinon from 'sinon';
import {expect} from 'chai';

/** @test {PortalServer} */
describe('PortalServer', () => {
  let server;
  before(() => {
    server = new PortalServer();
  });
  /** @test {PortalServer#start} */
  describe('#start', () => {
    before(() => {
      sinon
        .stub(configurators.server, 'configure')
        .returns(Promise.resolve());
      sinon
        .stub(configurators.auth, 'configure')
        .returns(Promise.resolve());
      sinon
        .stub(configurators.routes, 'configure')
        .returns(Promise.resolve());
      sinon
        .stub(configurators.logging, 'configure')
        .returns(Promise.resolve());
      sinon
        .stub(_mongoose, 'connectAsync')
        .returns(Promise.resolve());
      sinon
        .stub(HapiServer.prototype, 'start')
        .yields();
      server.start();
    });
    after(() => {
      configurators
        .server
        .configure
        .restore();
      configurators
        .auth
        .configure
        .restore();
      configurators
        .routes
        .configure
        .restore();
      configurators
        .logging
        .configure
        .restore();
      _mongoose
        .connectAsync
        .restore();
      HapiServer
        .prototype
        .start
        .restore();
    });
    it('connects to mongo', () => {
      return expect(_mongoose.connectAsync).to.have.been.called;
    });
    it('configures the hapi server with base configuration', () => {
      return expect(configurators.server.configure)
        .to
        .have
        .been
        .calledWith(server._hapiServer);
    });
    it('configures the hapi server with logging', () => {
      return expect(configurators.logging.configure)
        .to
        .have
        .been
        .calledWith(server._hapiServer);
    });
    it('configures the hapi server with routes', () => {
      return expect(configurators.routes.configure)
        .to
        .have
        .been
        .calledWith(server._hapiServer);
    });
    it('configures the hapi server with authentication', () => {
      return expect(configurators.auth.configure)
        .to
        .have
        .been
        .calledWith(server._hapiServer);
    });
  })
});
