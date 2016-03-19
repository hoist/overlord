'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.create = create;
exports.createForgottenPassword = createForgottenPassword;
exports.activateForgottenPassword = activateForgottenPassword;

var _model = require('@hoist/model');

var _application = require('./application');

var ApplicationLogic = _interopRequireWildcard(_application);

var _organisation = require('./organisation');

var OrganisationLogic = _interopRequireWildcard(_organisation);

var _emails = require('./emails');

var EmailLogic = _interopRequireWildcard(_emails);

var _slug = require('slug');

var _slug2 = _interopRequireDefault(_slug);

var _errors = require('@hoist/errors');

var _errors2 = _interopRequireDefault(_errors);

var _logger2 = require('@hoist/logger');

var _logger3 = _interopRequireDefault(_logger2);

var _validator = require('validator');

var _validator2 = _interopRequireDefault(_validator);

var _config = require('config');

var _config2 = _interopRequireDefault(_config);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var _logger = _logger3.default.child({
  cls: 'SessionLogic'
});

/**
 * create a new user. Also creates an organisation and an application for the user
 * @param {object} credentials - the user credentials
 * @param {string} credentials.username - the users username
 * @param {string} credentials.email - the user email
 * @param {string} credentials.password - this user password
 * @param {string} credentials.passwordCheck - this user password repeated
 * @returns {Promise<HoistUser>} - the hoist user that was created
 * @throws {errors.user.request.InvalidError} when the email is not valid
 * @throws {errors.user.credentials.IncorrectError} if the username already matches an existing username
 */
function create(_ref) {
  var username = _ref.username;
  var email = _ref.email;
  var password = _ref.password;
  var passwordCheck = _ref.passwordCheck;

  return Promise.resolve().then(function () {
    /* ensure request parameters are ok */
    _logger.info('checking required fields');
    if (!username || username.length < 1) {
      throw new _errors2.default.user.request.InvalidError("invalid name supplied");
    }
    if (!email || email.length < 1 || !_validator2.default.isEmail(email)) {
      throw new _errors2.default.user.request.InvalidError("invalid email supplied");
    }
    if (password !== passwordCheck) {
      throw new _errors2.default.user.request.InvalidError("supplied passwords don't match");
    }
    if (!password || password.length < 6) {
      throw new _errors2.default.user.request.InvalidError("invalid password supplied, passwords must be longer than 6 characters");
    }
  }).then(function () {
    /* load up the user */
    _logger.info('finding user');
    return _model.HoistUser.countAsync({
      "$or": [{
        'emailAddresses.address': email.toLowerCase()
      }, {
        name: username.toLowerCase()
      }]
    });
  }).then(function (userCount) {
    if (userCount > 0) {
      _logger.info('an account for that email address or username already exists');
      throw new _errors2.default.user.credentials.IncorrectError('an account for that email address already exists');
    }
    return _model.Organisation.countAsync({
      slug: (0, _slug2.default)(username)
    });
  }).then(function (organisationCount) {
    if (organisationCount > 0) {
      _logger.info('an organisation for that username already exists');
      throw new _errors2.default.user.credentials.IncorrectError('an organisation for that username already exists');
    }

    var user = new _model.HoistUser({
      name: username.toLowerCase(),
      emailAddresses: [{
        address: email.toLowerCase()
      }]
    });
    return user.setPassword(password);
  }).then(function (user) {
    return OrganisationLogic.create({
      personal: true,
      name: username
    }).then(function (organisation) {
      return ApplicationLogic.create({
        organisation: organisation,
        name: username
      }).then(function (application) {
        user.organisations.push(organisation);
        return user.saveAsync().catch(function (err) {
          return Promise.all([application.remove()]).then(function () {
            throw err;
          });
        });
      }).catch(function (err) {
        return Promise.all([organisation.remove()]).then(function () {
          throw err;
        });
      });
    });
  });
}

/**
 * creates a forgotten password for a user, or notifies them if they don't have an account.
 * @param {object} credentials - the user credentials
 * @param {string} credentials.email - the user email
 * @returns {Promise} - a promise to have created and emailed the forgotten password request
 * @throws {errors.user.request.InvalidError} when the email is not valid
 */
function createForgottenPassword(_ref2) {
  var email = _ref2.email;

  return Promise.resolve().then(function () {
    return _model.HoistUser.findOneAsync({
      'emailAddresses.address': email.toLowerCase()
    });
  }).then(function (user) {
    if (!user) {
      return EmailLogic.sendNoUserAcountEmail(email);
    }
    return new _model.HoistForgottenPassword({
      user: user
    }).saveAsync().then(function (forgottenPasswordRequest) {
      return EmailLogic.sendForgottenPasswordEmail(email, forgottenPasswordRequest.activationCode);
    });
  });
}

function activateForgottenPassword(_ref3) {
  var password = _ref3.password;
  var passwordCheck = _ref3.passwordCheck;
  var activationCode = _ref3.activationCode;

  return Promise.resolve().then(function () {
    return _model.HoistForgottenPassword.findOne({
      activationCode: activationCode,
      activated: false,
      $or: [{
        activatedDate: null
      }, {
        activatedDate: {
          $exists: false
        }
      }],
      createdAt: {
        $gt: (0, _moment2.default)().add('hour', -2).utc().toDate()
      }
    }).populate('user').exec();
  }).then(function (forgottenPassword) {
    if (!forgottenPassword) {
      throw new _errors2.default.HoistError("ForgottenPassword token not found");
    }
    if (password !== passwordCheck) {
      throw new _errors2.default.user.request.InvalidError("supplied passwords don't match");
    }
    if (!password || password.length < 6) {
      throw new _errors2.default.user.request.InvalidError("invalid password supplied, passwords must be longer than 6 characters");
    }

    return forgottenPassword.user.setPassword(password).then(function (u) {
      return u.saveAsync();
    });
  });
}
//# sourceMappingURL=../../maps/server/logic/user.js.map
