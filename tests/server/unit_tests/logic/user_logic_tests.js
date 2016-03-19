import {UserLogic, OrganisationLogic, ApplicationLogic} from '../../../../src/server/logic';
import chai, {expect} from 'chai';
import {HoistUser, Organisation, Application} from '@hoist/model';
import sinon from 'sinon';

describe('UserLogic', () => {
  /* @test {create} */
  describe('#create', () => {
    let validUser = {
      username: 'aname',
      email: 'test@hoist.io',
      password: 'aPasswordThatIsLong',
      passwordCheck: 'aPasswordThatIsLong'
    };
    describe('if no name supplied', () => {
      let _result;
      before(() => {
        _result = UserLogic.create(Object.assign({}, validUser, {username: null}))
      })
      it('fails with invalid message', () => {
        return expect(_result)
          .to
          .be
          .rejectedWith('invalid name supplied');
      });
    });
    describe('if no email supplied', () => {
      let _result;
      before(() => {
        _result = UserLogic.create(Object.assign({}, validUser, {email: null}))
      })
      it('fails with invalid message', () => {
        return expect(_result)
          .to
          .be
          .rejectedWith('invalid email supplied');
      });
    });
    describe('if invalid email is supplied', () => {
      let _result;
      before(() => {
        _result = UserLogic.create(Object.assign({}, validUser, {email: 'notanemailaddress'}))
      })
      it('fails with invalid message', () => {
        return expect(_result)
          .to
          .be
          .rejectedWith('invalid email supplied');
      });
    });
    describe('if no password supplied', () => {
      let _result;
      before(() => {
        _result = UserLogic.create(Object.assign({}, validUser, {
          password: null,
          passwordCheck: null
        }))
      })
      it('fails with invalid message', () => {
        return expect(_result)
          .to
          .be
          .rejectedWith('invalid password supplied');
      });
    });
    describe('if missmatched supplied', () => {
      let _result;
      before(() => {
        _result = UserLogic.create(Object.assign({}, validUser, {
          password: validUser
            .passwordCheck
            .toLowerCase()
        }))
      })
      it('fails with invalid message', () => {
        return expect(_result)
          .to
          .be
          .rejectedWith('supplied passwords don\'t match');
      });
    });
    describe('if existing user with email', () => {
      let _result;
      before(() => {
        sinon
          .stub(HoistUser, 'countAsync')
          .returns(Promise.resolve(1));
        _result = UserLogic.create(validUser);
      });
      after(() => {
        HoistUser
          .countAsync
          .restore();
      })
      it('looks up correct user', () => {
        return expect(HoistUser.countAsync)
          .to
          .have
          .been
          .calledWith({
            $or: [
              {
                'emailAddresses.address': validUser
                  .email
                  .toLowerCase()
              }, {
                'name': validUser.username
              }
            ]
          });
      });
      it('fails with invalid message', () => {
        return expect(_result)
          .to
          .be
          .rejectedWith('an account for that email address already exists');
      });
    });
    describe('if valid credentials passed in', () => {
      let _result;
      let _createdApplication = new Application();
      let _createdOrganisation = new Organisation();
      before(() => {

        sinon
          .stub(HoistUser.prototype, 'saveAsync', function () {
            return Promise.resolve(this);
          });
        sinon
          .stub(Organisation,'countAsync')
          .returns(Promise.resolve(0));
        sinon
          .stub(HoistUser, 'countAsync')
          .returns(Promise.resolve(0));
        sinon
          .stub(OrganisationLogic, 'create')
          .returns(Promise.resolve(_createdOrganisation));
        sinon
          .stub(ApplicationLogic, 'create')
          .returns(Promise.resolve(_createdApplication));
        _result = UserLogic.create(validUser);
      });
      after(() => {
        ApplicationLogic
          .create
          .restore();
        OrganisationLogic
          .create
          .restore();
        HoistUser
          .prototype
          .saveAsync
          .restore();
        HoistUser
          .countAsync
          .restore();
        Organisation
          .countAsync
          .restore();
      })
      it('returns a new user', () => {
        return expect(_result)
          .to
          .eventually
          .be
          .instanceof(HoistUser);
      });
      it('saves the user', () => {
        return _result.then((user) => {
          return expect(HoistUser.prototype.saveAsync)
            .to
            .have
            .been
            .calledOn(user);
        });
      });
      it('sets the user organisation', () => {
        return _result.then((user) => {
          return expect(user.organisations)
            .to
            .contain([_createdOrganisation]);
        });
      })
      it('creates organisation with the users name', () => {
        return expect(OrganisationLogic.create)
          .to
          .have
          .been
          .calledWith({name: validUser.username, personal: true});
      });
      it('creates application with correct name and organisation', () => {
        return expect(ApplicationLogic.create)
          .to
          .have
          .been
          .calledWith({name: validUser.username, organisation: _createdOrganisation});
      })
    });
  });
})
