'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.ensureLogin = ensureLogin;
exports.createSessionForUser = createSessionForUser;
exports.logLogin = logLogin;
exports.getSessionDetails = getSessionDetails;
exports.updateOrganisation = updateOrganisation;
exports.updateApplication = updateApplication;

var _model = require('@hoist/model');

var _errors = require('@hoist/errors');

var _errors2 = _interopRequireDefault(_errors);

var _logger2 = require('@hoist/logger');

var _logger3 = _interopRequireDefault(_logger2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _logger = _logger3.default.child({ cls: 'SessionLogic' });

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
function ensureLogin(_ref) {
  var _ref$email = _ref.email;
  var email = _ref$email === undefined ? "" : _ref$email;
  var password = _ref.password;
  var ipAddress = _ref.ipAddress;

  return Promise.resolve().then(function () {
    _logger.info('checking ip address');
    return _model.IpLog.assertIP({ ipAddress: ipAddress });
  }).then(function () {
    /* ensure request parameters are ok */
    _logger.info('checking email and username are set');
    if (!email || email.length < 1) {
      throw new _errors2.default.user.request.InvalidError("invalid email supplied");
    }
    if (!password || password.length < 1) {
      throw new _errors2.default.user.request.InvalidError("invalid password supplied");
    }
  }).then(function () {
    /* load up the user */
    _logger.info('finding user');
    return _model.HoistUser.findOneAsync({
      'emailAddresses.address': email.toLowerCase()
    });
  }).then(function (user) {
    if (!user) {
      _logger.info('email address supplied was incorrect');
      throw new _errors2.default.user.credentials.IncorrectError();
    }
    _logger.info('checking user lock');
    /* ensure the user isn't locked*/
    return _model.LoginLog.assertUser(user).then(function () {
      return user;
    });
  }).then(function (user) {
    /* check the user password */
    _logger.info('checking password');
    if (!user.verifyPassword(password)) {
      _logger.info('password supplied was incorrect');
      throw new _errors2.default.user.credentials.IncorrectError();
    }
    return user;
  });
}

/**
 * creates a session for the user based on their last logged in session
 * @param {HoistUser} user - the user to create a session for
 * @returns {Promise<Session>} - the created session
 */
function createSessionForUser(user) {
  /* load up the last session from this user */
  return _model.Session.find({ user: user._id }).sort({ updatedAt: -1 }).limit(1).select({ _id: -1, organisation: 1, application: 1 }).exec().then(function (_ref2) {
    var _ref3 = _slicedToArray(_ref2, 1);

    var lastSession = _ref3[0];

    var sessionData = Object.assign({}, {
      user: user
    }, lastSession);
    if (!sessionData.organisation && user.organisations && user.organisations.length > 0) {
      sessionData.organisation = user.organisations[user.organisations.length - 1];
    }
    if (!sessionData.application && sessionData.organisation) {
      //load first application for organisation by created date desc
      return _model.Application.find({ organisation: sessionData.organisation }).sort({ updatedAt: -1 }).limit(1).select({ _id: 1 }).exec().then(function (_ref4) {
        var _ref5 = _slicedToArray(_ref4, 1);

        var application = _ref5[0];

        if (application) {
          sessionData.application = application._id;
        }
        return sessionData;
      });
    }
    return sessionData;
  }).then(function (sessionData) {
    return new _model.Session(sessionData).saveAsync();
  }).then(function (result) {
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
function logLogin(_ref6, success) {
  var _ref6$email = _ref6.email;
  var email = _ref6$email === undefined ? "" : _ref6$email;
  var ipAddress = _ref6.ipAddress;

  return Promise.all([new _model.IpLog({ ip: ipAddress, success: success }).saveAsync(), new _model.LoginLog({
    username: email.toLowerCase(),
    success: success
  }).saveAsync()]);
}

/**
 * load up details of the users session from a session object
 * @param {Session} session - the users current session
 * @returns {SessionDetails} - the details of the currently logged in session
 */
function getSessionDetails(session) {
  var user = undefined;
  var organisation = undefined;
  var application = undefined;
  var organisations = undefined;
  var applications = undefined;
  return Promise.resolve().then(function () {
    return session.populate({ path: 'organisation', select: '_id slug name isPersonal' }).populate({ path: 'application', select: '_id slug name apiKey settings' }).populate({ path: 'user', select: 'name organisations emailAddresses role' }).execPopulate();
  }).then(function () {
    session = session.toJSON();
    user = Object.assign({}, session.user);
    application = Object.assign({}, session.application);
    organisation = Object.assign({}, session.organisation);
  }).then(function () {
    if (user && user.organisations) {
      return _model.Organisation.findAsync({
        _id: {
          $in: user.organisations
        }
      }, 'slug name isPersonal').then(function (result) {
        organisations = result.map(function (org) {
          return Object.assign({}, org.toJSON());
        });
        if (!organisation || !organisation._id) {
          if (organisations.length > 0) {
            organisation = organisations[organisations.length - 1];
          }
        }
      });
    }
  }).then(function () {
    if (organisation && organisation._id) {
      return _model.Application.findAsync({
        organisation: organisation._id
      }, 'slug name apiKey settings').then(function (results) {
        applications = results.map(function (app) {
          return Object.assign({}, app.toJSON());
        });
        if (applications.length > 0) {
          if (!application || !application._id) {
            application = applications[applications.length - 1];
          }
        }
      });
    }
  }).then(function () {
    return { user: user, organisation: organisation, application: application, organisations: organisations, applications: applications };
  });
}

/**
 * updates the session organisation, (sets the session application appropriately too) then returns the new session
 * @param {Session} session - the users current session
 * @param {string} organisationId - the new organisation id
 * @returns {SessionDetails} - the details of the currently logged in session
 * @throws {errors.model.organisation.NotFoundError} - either the organisation doesn't exist or the user doesn't have access
 */
function updateOrganisation(session, organisationId) {
  return Promise.resolve().then(function () {
    if (!session.user.organisations.find(function (id) {
      return id === organisationId;
    })) {
      throw new _errors2.default.model.organisation.NotFoundError();
    } else {
      session.organisation = organisationId;
      session.application = null;
      return getSessionDetails(session).then(function (sessionDetails) {
        session.application = sessionDetails.application._id;
        return session.saveAsync().then(function () {
          return sessionDetails;
        });
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
function updateApplication(session, applicationId) {
  return Promise.resolve().then(function () {
    return _model.Application.countAsync({ organisation: session.organisation._id, _id: applicationId });
  }).then(function (applicationCount) {
    if (applicationCount < 1) {
      throw new _errors2.default.model.organisation.NotFoundError();
    }
  }).then(function () {
    session.application = applicationId;
    return session.saveAsync().then(function () {
      return getSessionDetails(session);
    });
  });
}
//# sourceMappingURL=../../maps/server/logic/session.js.map
