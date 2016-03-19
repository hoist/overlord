import {
  HoistUser,
  Organisation,
  HoistForgottenPassword
} from '@hoist/model';
import * as ApplicationLogic from './application';
import * as OrganisationLogic from './organisation';
import * as EmailLogic from './emails';
import slugify from 'slug';
import errors from '@hoist/errors';

import logger from '@hoist/logger';
import validator from 'validator';
import config from 'config';
import moment from 'moment';

let _logger = logger.child({
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
export function create({
  username,
  email,
  password,
  passwordCheck
}) {
  return Promise
    .resolve()
    .then(() => {
      /* ensure request parameters are ok */
      _logger.info('checking required fields');
      if (!username || username.length < 1) {
        throw new errors
          .user
          .request
          .InvalidError("invalid name supplied");
      }
      if (!email || email.length < 1 || !validator.isEmail(email)) {
        throw new errors
          .user
          .request
          .InvalidError("invalid email supplied");
      }
      if (password !== passwordCheck) {
        throw new errors
          .user
          .request
          .InvalidError("supplied passwords don't match");
      }
      if (!password || password.length < 6) {
        throw new errors
          .user
          .request
          .InvalidError("invalid password supplied, passwords must be longer than 6 characters");
      }
    })
    .then(() => {
      /* load up the user */
      _logger.info('finding user');
      return HoistUser.countAsync({
        "$or": [
          {
            'emailAddresses.address': email.toLowerCase()
          }, {
            name: username.toLowerCase()
          }
        ]
      });
    })
    .then((userCount) => {
      if (userCount > 0) {
        _logger.info('an account for that email address or username already exists');
        throw new errors
          .user
          .credentials
          .IncorrectError('an account for that email address already exists');
      }
      return Organisation.countAsync({
        slug: slugify(username)
      });
    })
    .then(organisationCount => {
      if (organisationCount > 0) {
        _logger.info('an organisation for that username already exists');
        throw new errors
          .user
          .credentials
          .IncorrectError('an organisation for that username already exists');
      }

      let user = new HoistUser({
        name: username.toLowerCase(),
        emailAddresses: [
          {
            address: email.toLowerCase()
          }
        ]
      });
      return user.setPassword(password);
    })
    .then((user) => {
      return OrganisationLogic
        .create({
          personal: true,
          name: username
        })
        .then((organisation) => ApplicationLogic.create({
            organisation: organisation,
            name: username
          })
          .then((application) => {
            user
              .organisations
              .push(organisation);
            return user
              .saveAsync()
              .catch((err) => {
                return Promise
                  .all([application.remove()])
                  .then(() => {
                    throw err;
                  })
              });
          })
          .catch((err) => {
            return Promise
              .all([organisation.remove()])
              .then(() => {
                throw err;
              })
          }));
    });
}

/**
 * creates a forgotten password for a user, or notifies them if they don't have an account.
 * @param {object} credentials - the user credentials
 * @param {string} credentials.email - the user email
 * @returns {Promise} - a promise to have created and emailed the forgotten password request
 * @throws {errors.user.request.InvalidError} when the email is not valid
 */
export function createForgottenPassword({
  email
}) {
  return Promise
    .resolve()
    .then(() => {
      return HoistUser.findOneAsync({
        'emailAddresses.address': email.toLowerCase()
      });
    })
    .then((user) => {
      if (!user) {
        return EmailLogic.sendNoUserAcountEmail(email);
      }
      return new HoistForgottenPassword({
          user: user
        })
        .saveAsync()
        .then((forgottenPasswordRequest) => EmailLogic.sendForgottenPasswordEmail(email, forgottenPasswordRequest.activationCode))
    });

}

export function activateForgottenPassword({
  password,
  passwordCheck,
  activationCode
}) {
  return Promise.resolve()
    .then(() => {
      return HoistForgottenPassword.findOne({
          activationCode,
          activated: false,
          $or: [{
            activatedDate: null
          }, {
            activatedDate: {
              $exists: false
            }
          }],
          createdAt: {
            $gt: moment()
              .add('hour', -2)
              .utc()
              .toDate()
          }
        })
        .populate('user')
        .exec();
    })
    .then(forgottenPassword => {
      if (!forgottenPassword) {
        throw new errors.HoistError("ForgottenPassword token not found");
      }
      if (password !== passwordCheck) {
        throw new errors
          .user
          .request
          .InvalidError("supplied passwords don't match");
      }
      if (!password || password.length < 6) {
        throw new errors
          .user
          .request
          .InvalidError("invalid password supplied, passwords must be longer than 6 characters");
      }

      return forgottenPassword.user.setPassword(password)
        .then((u) => {
          return u.saveAsync();
        });
    });
}
