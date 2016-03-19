import {SessionLogic} from '../../../../src/server/logic';
import chai, {expect} from 'chai';
import {
  IpLog,
  LoginLog,
  HoistUser,
  Session,
  Application,
  Organisation
} from '@hoist/model';
import sinon from 'sinon';

describe('SessionLogic', () => {
  /** @test {ensureLogin} */
  describe('#ensureLogin', () => {
    let validLogin = {
      email: 'UnitTest@Hoist.Io',
      password: 'some password',
      ipAddress: 'some ip address'
    }
    let user = {
      verifyPassword: sinon
        .stub()
        .returns(true)
    }
    before(() => {
      sinon
        .stub(IpLog, 'assertIP')
        .returns(Promise.resolve());
      sinon
        .stub(LoginLog, 'assertUser')
        .returns(Promise.resolve())
      sinon
        .stub(HoistUser, 'findOneAsync')
        .returns(user);
    });
    after(() => {
      IpLog
        .assertIP
        .restore();
      LoginLog
        .assertUser
        .restore()
      HoistUser
        .findOneAsync
        .restore();
    });
    describe('with missing email', () => {
      let loginResult;
      before(() => {
        //remove email without modifying the original object
        let details = Object.assign({}, validLogin);
        delete details.email;
        loginResult = SessionLogic.ensureLogin(details);
      });
      it('returns rejection', () => {
        return expect(loginResult)
          .to
          .be
          .rejectedWith('invalid email supplied');
      })
      after(() => {
        IpLog
          .assertIP
          .reset();
      });
    });
    describe('with missing password', () => {
      let loginResult;
      before(() => {
        //remove password without modifying the original object
        let details = Object.assign({}, validLogin);
        delete details.password;
        loginResult = SessionLogic.ensureLogin(details);
      });
      it('returns rejection', () => {
        return expect(loginResult)
          .to
          .be
          .rejectedWith('invalid password supplied');
      })
      after(() => {
        IpLog
          .assertIP
          .reset();
      });
    });
    describe('with invalid ip address', () => {
      let loginResult;
      before(() => {
        IpLog
          .assertIP
          .throws(new Error('this is an invalid ip address'));
        loginResult = SessionLogic.ensureLogin(validLogin);
      });
      after(() => {
        IpLog
          .assertIP
          .returns(Promise.resolve());
        IpLog
          .assertIP
          .reset();
      });
      it('returns rejection', () => {
        return expect(loginResult)
          .to
          .be
          .rejectedWith('this is an invalid ip address');
      });
      it('doesn\'t load user', () => {
        return expect(HoistUser.findOneAsync).to.have.not.been.called;
      });
    });
    describe('with locked username', () => {
      let loginResult;
      before(() => {
        LoginLog
          .assertUser
          .throws(new Error('this is an invalid username'));
        loginResult = SessionLogic.ensureLogin(validLogin);
      });
      it('checks lock with user', () => {
        return expect(LoginLog.assertUser)
          .to
          .have
          .been
          .calledWith(user);
      });
      it('returns rejection', () => {
        return expect(loginResult)
          .to
          .be
          .rejectedWith('this is an invalid username');
      });
      it('doesn\'t check user password', () => {
        return expect(user.verifyPassword).to.have.not.been.called;
      });
      after(() => {
        LoginLog
          .assertUser
          .returns(Promise.resolve());
        LoginLog
          .assertUser
          .reset();
        IpLog
          .assertIP
          .reset();
      })
    });
    describe('with invalid password', () => {
      let loginResult;
      before(() => {
        user
          .verifyPassword
          .returns(false);
        loginResult = SessionLogic.ensureLogin(validLogin);
      });
      it('returns rejection', () => {
        return expect(loginResult)
          .to
          .be
          .rejectedWith('The username and/or password were not correct');
      });
      after(() => {
        user
          .verifyPassword
          .returns(true);
        user
          .verifyPassword
          .reset();
        HoistUser
          .findOneAsync
          .reset();
        LoginLog
          .assertUser
          .reset();
        IpLog
          .assertIP
          .reset();
      })
    });
    describe('with invalid username', () => {
      let loginResult;
      before(() => {
        HoistUser
          .findOneAsync
          .returns(Promise.resolve(null));
        loginResult = SessionLogic.ensureLogin(validLogin);
      });
      it('returns rejection', () => {
        return expect(loginResult)
          .to
          .be
          .rejectedWith('The username and/or password were not correct');
      });
      after(() => {
        HoistUser
          .findOneAsync
          .returns(Promise.resolve(user));
        user
          .verifyPassword
          .reset();
        HoistUser
          .findOneAsync
          .reset();
        LoginLog
          .assertUser
          .reset();
        IpLog
          .assertIP
          .reset();
      })
    });
    describe('with valid details', () => {
      let loginResult;
      before(() => {
        loginResult = SessionLogic.ensureLogin(validLogin);
      });
      it('returns user', () => {
        return expect(loginResult)
          .to
          .eventually
          .become(user);
      });
      it('looks up user by lowercase email', () => {
        return expect(HoistUser.findOneAsync)
          .to
          .have
          .been
          .calledWith({'emailAddresses.address': 'unittest@hoist.io'});
      });
      after(() => {
        IpLog
          .assertIP
          .reset();
        user
          .verifyPassword
          .reset();
        LoginLog
          .assertUser
          .reset();
        HoistUser
          .findOneAsync
          .reset();
      });
    });
  });

  /** @test {getSessionDetails} */
  describe('#getSessionDetails', () => {
    let result;
    let user = {
      organisations: [
        'org1', 'org2'
      ],
      toJSON: sinon
        .stub()
        .returnsThis()
    };
    let organisation = {
      _id: 'orgid',
      name: 'organisation',
      toJSON: sinon
        .stub()
        .returnsThis()
    };
    let application = {
      _id: 'applicationid',
      name: 'application',
      toJSON: sinon
        .stub()
        .returnsThis()
    };
    let applications = [
      {
        slug: 'app1',
        name: 'app1',
        toJSON: sinon
          .stub()
          .returnsThis()
      }, {
        slug: 'app2',
        name: 'app2',
        toJSON: sinon
          .stub()
          .returnsThis()
      }
    ];
    let organisations = [
      {
        slug: 'org1',
        name: 'org1',
        toJSON: sinon
          .stub()
          .returnsThis()
      }, {
        slug: 'org2',
        name: 'org2',
        toJSON: sinon
          .stub()
          .returnsThis()
      }
    ];
    let session = {
      user: user,
      organisation: organisation,
      application: application,
      populate: sinon
        .stub()
        .returnsThis(),
      execPopulate: sinon
        .stub()
        .returns(Promise.resolve()),
      toJSON: sinon
        .stub()
        .returnsThis()
    };
    before(() => {
      sinon
        .stub(Application, 'findAsync')
        .returns(Promise.resolve(applications));
      sinon
        .stub(Organisation, 'findAsync')
        .returns(Promise.resolve(organisations));
      return SessionLogic
        .getSessionDetails(session)
        .then((sessionDetails) => {
          result = sessionDetails;
        });
    });

    it('returns current user', () => {
      return expect(result.user)
        .to
        .eql(user);
    });
    it('returns current organisation', () => {
      return expect(result.organisation)
        .to
        .eql(organisation);
    });
    it('returns current application', () => {
      return expect(result.application)
        .to
        .eql(application);
    });
    it('returns available applications', () => {
      return expect(result.applications)
        .to
        .eql(applications);
    });
    it('returns available organisations', () => {
      return expect(result.organisations)
        .to
        .eql(organisations);
    });
    it('looks up orgs based on user', () => {
      return expect(Organisation.findAsync)
        .to
        .have
        .been
        .calledWith({
          _id: {
            $in: ['org1', 'org2']
          }
        }, 'slug name isPersonal')
    });
    it('looks up applications based on organisation', () => {
      return expect(Application.findAsync)
        .to
        .have
        .been
        .calledWith({
          organisation: 'orgid'
        }, 'slug name apiKey settings');
    })
    after(() => {
      Application
        .findAsync
        .restore();
      Organisation
        .findAsync
        .restore();
    });
  });

  /** @test {createSessionForUser} */
  describe('#createSessionForUser', () => {
    let sessionQuery = {
      select: sinon
        .stub()
        .returnsThis(),
      limit: sinon
        .stub()
        .returnsThis(),
      sort: sinon
        .stub()
        .returnsThis(),
      exec: sinon
        .stub()
        .returns(Promise.resolve([]))
    }
    let session = {
      name: 'session'
    };
    let user = {
      _id: 'userid',
      name: 'user',
      organisations: ['org1', 'org2']
    };
    before(() => {
      sinon
        .stub(Session, 'find')
        .returns(sessionQuery)
      sinon
        .stub(Session.prototype, 'saveAsync')
        .returns(Promise.resolve(session));
    })
    after(() => {
      Session
        .find
        .restore();
    })
    describe('with previous session', () => {
      let previousSession = {
        organisation: 'organisationid',
        application: 'applicationid'
      }
      before(() => {
        sessionQuery
          .exec
          .returns(Promise.resolve([previousSession]));
      });
      after(() => {
        sessionQuery
          .exec
          .returns(Promise.resolve([]));
      });
      describe('with a selected organisation and application', () => {
        let result;
        before(() => {
          result = SessionLogic.createSessionForUser(user);
        })
        it('loads the correct session', () => {
          return expect(Session.find)
            .to
            .have
            .been
            .calledWith({user: 'userid'});
        });
        it('selects only the organisation and application fields', () => {
          return expect(sessionQuery.select)
            .to
            .have
            .been
            .calledWith({_id: -1, application: 1, organisation: 1});
        });
        it('creates session with matching application and organisation', () => {
          return expect(Session.prototype.saveAsync)
            .to
            .have
            .been
            .calledOn(sinon.match({organisation: 'organisationid', application: 'applicationid', user: 'userid'}));
        });
        it('returns saved session', () => {
          return expect(result)
            .to
            .eventually
            .become(session);
        });
        after(() => {
          Session
            .find
            .reset();
          Session
            .prototype
            .saveAsync
            .reset();
        })
      });
      describe('without a selected organisation and application', () => {
        let result;
        before(() => {
          delete previousSession.organisation;
          delete previousSession.application;
          let application = {
            _id: 'app2'
          };
          let applicationQuery = {
            limit:sinon.stub().returnsThis(),
            sort:sinon.stub().returnsThis(),
            select: sinon.stub().returnsThis(),
            exec: sinon
              .stub()
              .returns(Promise.resolve([application]))
          };
          sinon
            .stub(Application, 'find')
            .returns(applicationQuery);
          result = SessionLogic.createSessionForUser(user);
        });
        it('creates session with last created organisation and last created application', () => {
          return expect(Session.prototype.saveAsync)
            .to
            .have
            .been
            .calledOn(sinon.match({user: 'userid', organisation: 'org2', application: 'app2'}));
        });
        it('finds last created application', () => {
          return expect(Application.find)
            .to
            .have
            .been
            .calledWith({
              organisation: "org2"
            });
        });
        it('returns saved session', () => {
          return expect(result)
            .to
            .eventually
            .become(session);
        });
        after(() => {
          previousSession.organisation = 'organisationid';
          previousSession.application = 'applicationid';
          Session
            .find
            .reset();
          Session
            .prototype
            .saveAsync
            .reset();
          Application
            .find
            .restore();
        })
      });
    });
  });

  /** @test {logLogin}  */
  describe('#logLogin', () => {
    before(() => {
      sinon.stub(LoginLog.prototype, 'saveAsync');
      sinon.stub(IpLog.prototype, 'saveAsync');
    });
    after(() => {
      LoginLog
        .prototype
        .saveAsync
        .restore();
      IpLog
        .prototype
        .saveAsync
        .restore();
    })
    describe('with successful login', () => {
      before(() => {
        return SessionLogic.logLogin({
          email: "unittest@hoist.io",
          ipAddress: 'test-ip-address'
        }, true);
      });
      it('saves a success ip log', () => {
        return expect(IpLog.prototype.saveAsync)
          .to
          .have
          .been
          .calledOn(sinon.match({ip: 'test-ip-address', success: true}));
      });
      it('saves a success login log', () => {
        return expect(LoginLog.prototype.saveAsync)
          .to
          .have
          .been
          .calledOn(sinon.match({username: "unittest@hoist.io", success: true}));
      });
      after(() => {
        IpLog
          .prototype
          .saveAsync
          .reset();
        LoginLog
          .prototype
          .saveAsync
          .reset();
      });
    })
    describe('with unsuccessful login', () => {
      before(() => {
        return SessionLogic.logLogin({
          email: "unittest@hoist.io",
          ipAddress: 'test-ip-address'
        }, false);
      });
      it('saves a fail ip log', () => {
        return expect(IpLog.prototype.saveAsync)
          .to
          .have
          .been
          .calledOn(sinon.match({ip: 'test-ip-address', success: false}));
      });
      it('saves a fail login log', () => {
        return expect(LoginLog.prototype.saveAsync)
          .to
          .have
          .been
          .calledOn(sinon.match({username: "unittest@hoist.io", success: false}));
      });
      after(() => {
        IpLog
          .prototype
          .saveAsync
          .reset();
        LoginLog
          .prototype
          .saveAsync
          .reset();
      });
    })
  });
});
