import {
  IpLog,
  LoginLog,
  Application,
  HoistUser,
  Organisation,
  Session
} from '@hoist/model';
import errors from '@hoist/errors';

import logger from '@hoist/logger';

let _logger = logger.child({cls: 'SessionLogic'});

/**
 * get a user based on login details, verifies password and ip address
 * @param {object} credentials - the user credentials
 * @param {string} credentials.email - the user email
 * @param {string} credentials.password - this user password
 * @param {string} credentials.ipAddress - the users ipAddress
 * @returns {Promise<HoistUser>} - the hoist user on successful login
 * @throws {errors.user.request.InvalidError} when the email or password is incorrect
 * @throws {errors.user.credentials.IncorrectError} when the user email or password are incorrect
 * @throws {errors.user.request.IPLockedError} when ip address is locked
 * @throws {errors.user.request.AccountLockedError} when ip address is locked
 */
export function ensureLogin({
  email = "",
  password,
  ipAddress
}) {
  return Promise
    .resolve()
    .then(() => {
      _logger.info('checking ip address');
      return IpLog.assertIP({ipAddress});
    })
    .then(() => {
      /* ensure request parameters are ok */
      _logger.info('checking email and username are set');
      if (!email || email.length < 1) {
        throw new errors
          .user
          .request
          .InvalidError("invalid email supplied");
      }
      if (!password || password.length < 1) {
        throw new errors
          .user
          .request
          .InvalidError("invalid password supplied");
      }
    })
    .then(() => {
      /* load up the user */
      _logger.info('finding user');
      return HoistUser.findOneAsync({
        'emailAddresses.address': email.toLowerCase()
      });
    })
    .then((user) => {
      if (!user) {
        _logger.info('email address supplied was incorrect');
        throw new errors
          .user
          .credentials
          .IncorrectError();
      }
      _logger.info('checking user lock');
      /* ensure the user isn't locked*/
      return LoginLog
        .assertUser(user)
        .then(() => user);
    })
    .then((user) => {
      /* check the user password */
      _logger.info('checking password');
      if (!user.verifyPassword(password)) {
        _logger.info('password supplied was incorrect');
        throw new errors
          .user
          .credentials
          .IncorrectError();
      }
      return user;
    });
}

/**
 * creates a session for the user based on their last logged in session
 * @param {HoistUser} user - the user to create a session for
 * @returns {Promise<Session>} - the created session
 */
export function createSessionForUser(user) {
  /* load up the last session from this user */
  return Session
    .find({user: user._id})
    .sort({updatedAt: -1})
    .limit(1)
    .select({_id: -1, organisation: 1, application: 1})
    .exec()
    .then(([lastSession]) => {
      let sessionData = Object.assign({}, {
        user: user
      }, lastSession);
      if (!sessionData.organisation && user.organisations && user.organisations.length > 0) {
        sessionData.organisation = user.organisations[user.organisations.length - 1];
      }
      if (!sessionData.application && sessionData.organisation) {
        //load first application for organisation by created date desc
        return Application
          .find({organisation: sessionData.organisation})
          .sort({updatedAt: -1})
          .limit(1)
          .select({_id: 1})
          .exec()
          .then(([application]) => {
            if (application) {
              sessionData.application = application._id;
            }
            return sessionData;
          });
      }
      return sessionData;
    })
    .then((sessionData) => new Session(sessionData).saveAsync())
    .then((result) => {
      if (result && result.length) {
        return result[0];
      } else {
        return result;
      }
    });
}

/**
 * saves login attempts to the database against username and ip addresses
 * @param {object} credentials - the user credentials
 * @param {string} credentials.email - the user email
 * @param {string} credentials.ipAddress - the users ipAddress
 * @param {bool} success - if the login was successful or not
 * @returns {Promise} - a promise to have saved the login logs
 */
export function logLogin({
  email = "",
  ipAddress
}, success) {
  return Promise.all([
    new IpLog({ip: ipAddress, success}).saveAsync(),
    new LoginLog({
      username: email.toLowerCase(),
      success
    }).saveAsync()
  ])
}

/**
 * load up details of the users session from a session object
 * @param {Session} session - the users current session
 * @returns {SessionDetails} - the details of the currently logged in session
 */
export function getSessionDetails(session) {
  let user;
  let organisation;
  let application;
  let organisations;
  let applications;
  return Promise
    .resolve()
    .then(() => {
      return session
        .populate({path: 'organisation', select: '_id slug name isPersonal'})
        .populate({path: 'application', select: '_id slug name apiKey settings'})
        .populate({path: 'user', select: 'name organisations emailAddresses role'})
        .execPopulate();
    })
    .then(() => {
      session = session.toJSON();
      user = Object.assign({}, session.user);
      application = Object.assign({}, session.application);
      organisation = Object.assign({}, session.organisation);
    })
    .then(() => {
      if (user && user.organisations) {
        return Organisation.findAsync({
          _id: {
            $in: user.organisations
          }
        }, 'slug name isPersonal').then((result) => {
          organisations = result.map((org) => Object.assign({}, org.toJSON()));
          if (!organisation || !organisation._id) {
            if (organisations.length > 0) {
              organisation = organisations[organisations.length - 1];
            }
          }
        });
      }
    })
    .then(() => {
      if (organisation && organisation._id) {
        return Application.findAsync({
          organisation: organisation._id
        }, 'slug name apiKey settings').then((results) => {
          applications = results.map((app) => Object.assign({}, app.toJSON()));
          if (applications.length > 0) {
            if (!application || !application._id) {
              application = applications[applications.length - 1];
            }
          }
        });
      }
    })
    .then(() => {
      return {user, organisation, application, organisations, applications}
    });
}

/**
 * updates the session organisation, (sets the session application appropriately too) then returns the new session
 * @param {Session} session - the users current session
 * @param {string} organisationId - the new organisation id
 * @returns {SessionDetails} - the details of the currently logged in session
 * @throws {errors.model.organisation.NotFoundError} - either the organisation doesn't exist or the user doesn't have access
 */
export function updateOrganisation(session, organisationId) {
  return Promise
    .resolve()
    .then(() => {
      if (!session.user.organisations.find((id) => id === organisationId)) {
        throw new errors
          .model
          .organisation
          .NotFoundError();
      } else {
        session.organisation = organisationId;
        session.application = null;
        return getSessionDetails(session).then((sessionDetails) => {
          session.application = sessionDetails.application._id;
          return session
            .saveAsync()
            .then(() => sessionDetails);
        });
      }
    });
}

/**
 * updates the session application then returns the new session
 * @param {Session} session - the users current session
 * @param {string} applicationId - the new application id
 * @returns {SessionDetails} - the details of the currently logged in session
 * @throws {errors.model.organisation.NotFoundError} - either the organisation doesn't exist or the user doesn't have access
 */
export function updateApplication(session, applicationId) {
  return Promise
    .resolve()
    .then(() => {
      return Application.countAsync({organisation: session.organisation._id, _id: applicationId});
    })
    .then((applicationCount) => {
      if (applicationCount < 1) {
        throw new errors
          .model
          .organisation
          .NotFoundError();
      }
    })
    .then(() => {
      session.application = applicationId;
      return session
        .saveAsync()
        .then(() => getSessionDetails(session));
    });
}
