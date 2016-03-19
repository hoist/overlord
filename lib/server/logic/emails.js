'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.sendForgottenPasswordEmail = sendForgottenPasswordEmail;
exports.sendNoUserAcountEmail = sendNoUserAcountEmail;

var _handlebars = require('handlebars');

var _handlebars2 = _interopRequireDefault(_handlebars);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _postmark = require('postmark');

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _config = require('config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var postmark = new _postmark.Client(_config2.default.get('Hoist.postmark.key'));

_bluebird2.default.promisifyAll(postmark);
_bluebird2.default.promisifyAll(_fs2.default);

var templatesDir = _path2.default.resolve(__dirname, '../email_templates');

var _loadTemplates = function loadTemplates() {
  return Promise.all([_fs2.default.readFileAsync(templatesDir + '/html_template.hbs', 'utf8'), _fs2.default.readFileAsync(templatesDir + '/text_template.hbs', 'utf8')]).then(function (templates) {
    return templates.map(function (t) {
      return _handlebars2.default.compile(t);
    });
  }).then(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2);

    var htmlTemplate = _ref2[0];
    var textTemplate = _ref2[1];

    _loadTemplates = function loadTemplates() {
      return Promise.resolve({
        htmlTemplate: htmlTemplate,
        textTemplate: textTemplate
      });
    };
    return _loadTemplates();
  });
};

function sendForgottenPasswordEmail(address, activationCode) {
  var forgottenPasswordLink = 'https://' + _config2.default.get('Hoist.domains.portal') + '/forgot-password/' + encodeURIComponent(activationCode);
  return sendEmail({
    To: address,
    Subject: 'Hoist Password Reset',
    Title: 'Password Reset',
    Message: ["Someone used this email address to request a new password for Hoist.", "To reset your password head here: <a href='" + forgottenPasswordLink + "' style='color:#333333;text-decoration:underline;'>" + forgottenPasswordLink + "</a>.", "If this wasn't you, simply ignore this email or hit reply to let us know."],
    Action: {
      Text: "Reset Password &rarr;",
      Link: 'forgottenPassword'
    }
  });
}
function sendNoUserAcountEmail(address) {
  return sendEmail({
    To: address,
    Subject: 'Someone tried to reset their password on Hoist',
    Title: "Someone tried to reset their password on Hoist",
    Message: ["Someone used this email address to request a new password for Hoist, you don't currently have an account.", "<a href='" + "https://" + _config2.default.get('Hoist.domains.portal') + "/signup' style='color:#333333'>Sign up here</a>, if you have any questions feel free to email <a href='mailto:jamie@hoist.io' style='color:#333333'>support@hoist.io</a>.", "If this wasn't you, simply ignore this email or hit reply to let us know."],
    Action: {
      Text: "Sign Up &rarr;",
      Link: "https://" + _config2.default.get('Hoist.domains.portal') + "/signup"
    }
  });
}

function sendEmail(emailData) {
  return generateEmailBody(emailData).then(function (email) {
    return Object.assign({}, email, {
      From: 'Hoist <hoist@notifications.hoi.io>',
      ReplyTo: 'Hoist <support@hoist.io>'
    });
  }).then(function (em) {
    return em;
  }).then(function (em) {
    return postmark.sendAsync(em);
  });
}

function generateEmailBody(emailData) {
  return _loadTemplates().then(function (templates) {
    emailData = Object.assign({
      blocks: {},
      data: {}
    }, emailData, {
      config: {
        src: 'https://' + _config2.default.get('Hoist.domains.portal') + '/'
      }
    });
    return Promise.resolve(Object.assign({}, emailData, {
      HtmlBody: templates.htmlTemplate(emailData),
      TextBody: templates.textTemplate(emailData)
    }));
  });
}
//# sourceMappingURL=../../maps/server/logic/emails.js.map
