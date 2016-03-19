import {
  expect
}
from 'chai';
import {
  SessionController
}
from '../../../../src/server/areas/session/session_controller';
import sinon from 'sinon';
import {
  SessionLogic
}
from '../../../../src/server/logic';

/** @test {SessionController} */
describe('SessionController', () => {
  let controller;
  before(() => {
    controller = new SessionController();
  });

  /** @test {SessionController#routes} */
  describe('#routes', () => {
    let routes;
    before(() => {
      routes = controller.routes();
    });
    it('defines a create route', () => {
      return expect(routes)
        .to
        .contain({
          "config": {
            "auth": {
              "mode": "try",
              "strategy": "session"
            },
            "handler": controller.create,
            "plugins": {
              "hapi-auth-cookie": {
                "redirectTo": false
              }
            }
          },
          "method": "POST",
          "path": "/session"
        })
    });
  });

  /** @test {SessionController#create} */
  describe('#create', () => {
    let request = {
      info: {
        remoteAddress: 'unit-test-ip-address'
      },
      headers: {},
      payload: {
        email: 'unittest@hoist.io',
        password: 'password'
      },
      cookieAuth: {
        set: sinon.stub()
      }

    };
    let reply = sinon.stub();
    let user = {
      name: 'users'
    };
    let session = {
      _id: 'some id',
      key: 'some key',
      user: 'userid',
      organisation: 'organisationid',
      application: 'applicationid'
    };
    let sessionDetails = {
      user: {}
    }
    before(() => {
      sinon
        .stub(SessionLogic, 'ensureLogin')
        .returns(Promise.resolve(user));
      sinon
        .stub(SessionLogic, 'logLogin')
        .returns(Promise.resolve());
      sinon
        .stub(SessionLogic, 'createSessionForUser')
        .returns(Promise.resolve(session));
      sinon
        .stub(SessionLogic, 'getSessionDetails')
        .returns(Promise.resolve(sessionDetails));
    });
    after(() => {
      SessionLogic
        .ensureLogin
        .restore();
      SessionLogic
        .logLogin
        .restore();
      SessionLogic
        .createSessionForUser
        .restore();
      SessionLogic
        .getSessionDetails
        .restore();
    });
    describe('if user validation fails', () => {
      before(() => {
        SessionLogic
          .ensureLogin
          .throws();
        return controller.create(request, reply);
      });
      it('replies with error response', () => {
        return expect(reply)
          .to
          .have
          .been
          .calledWith(sinon.match({
            code: 500,
            message: 'An unexpected HoistError occurred.'
          }));
      });
      it('logs an invalid login', () => {
        return expect(SessionLogic.logLogin)
          .to
          .have
          .been
          .calledWith({
            email: 'unittest@hoist.io',
            password: 'password',
            ipAddress: 'unit-test-ip-address'
          }, false);
      });
      after(() => {
        SessionLogic
          .ensureLogin
          .returns(Promise.resolve(user));
        SessionLogic
          .ensureLogin
          .reset();
        SessionLogic
          .createSessionForUser
          .reset();
        SessionLogic
          .getSessionDetails
          .reset();
        SessionLogic
          .logLogin
          .reset();
        reply.reset();
      });
    });
    describe('if validation succeeds', () => {
      before(() => {
        return controller.create(request, reply);
      });
      it('replies with session details', () => {
        return expect(reply)
          .to
          .have
          .been
          .calledWith(sessionDetails);
      });
      it('saves session to cookie', () => {
        return expect(request.cookieAuth.set)
          .to
          .have
          .been
          .calledWith(session);
      });
      it('logs a valid login', () => {
        return expect(SessionLogic.logLogin)
          .to
          .have
          .been
          .calledWith({
            email: 'unittest@hoist.io',
            password: 'password',
            ipAddress: 'unit-test-ip-address'
          }, true);
      });
      after(() => {
        SessionLogic
          .ensureLogin
          .reset();
        SessionLogic
          .createSessionForUser
          .reset();
        SessionLogic
          .getSessionDetails
          .reset();
        SessionLogic
          .logLogin
          .reset();
        reply.reset();
      });
    });
    describe('if header contains x-real-ip', () => {
      before(() => {
        request.headers['x-real-ip'] = 'ip-address-override';
        return controller.create(request, reply);
      });
      it('uses the override ip address to log login attempt', () => {
        return expect(SessionLogic.logLogin)
          .to
          .have
          .been
          .calledWith(sinon.match({
            ipAddress: 'ip-address-override'
          }));
      });
      it('uses override ip to validate user', () => {
        return expect(SessionLogic.ensureLogin)
          .to
          .have
          .been
          .calledWith(sinon.match({
            ipAddress: 'ip-address-override'
          }))
      });
      after(() => {
        delete request.headers['x-real-ip'];
        SessionLogic
          .ensureLogin
          .reset();
        SessionLogic
          .createSessionForUser
          .reset();
        SessionLogic
          .getSessionDetails
          .reset();
        SessionLogic
          .logLogin
          .reset();
        reply.reset();
      });
    });
  });
  /** @test {SessionController#destroy} */
  describe('#destroy', () => {
    let request = {
      cookieAuth: {
        clear: sinon.stub()
      },
      auth: {
        isAuthenticated: true,

      }
    };
    let reply = sinon.stub();
    before(() => {
      return controller.destroy(request, reply);
    });
    it('returns simple message', () => {
      return expect(reply)
        .to
        .have
        .been
        .calledWith({
          ok: true
        });
    });
    it('clears current session', () => {
      return expect(request.cookieAuth.clear)
        .to.have.been.called;
    });

  });
});