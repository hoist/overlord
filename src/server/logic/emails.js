import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import {
  Client as PostmarkClient
} from 'postmark';
import Bluebird from 'bluebird';
import config from 'config';

let postmark = new PostmarkClient(config.get('Hoist.postmark.key'));

Bluebird.promisifyAll(postmark);
Bluebird.promisifyAll(fs);

let templatesDir = path.resolve(__dirname, '../email_templates');

var loadTemplates = function () {
  return Promise.all([
    fs.readFileAsync(templatesDir + '/html_template.hbs', 'utf8'),
    fs.readFileAsync(templatesDir + '/text_template.hbs', 'utf8')
  ])
    .then(templates => {
      return templates.map((t) => {
        return handlebars.compile(t);
      });
    })
    .then(([htmlTemplate, textTemplate]) => {
      loadTemplates = function () {
        return Promise.resolve({
          htmlTemplate,
          textTemplate
        });
      }
      return loadTemplates();
    });
}

export function sendForgottenPasswordEmail(address, activationCode) {
  let forgottenPasswordLink = `https://${config.get('Hoist.domains.portal')}/forgot-password/${encodeURIComponent(activationCode)}`;
  return sendEmail({
    To: address,
    Subject: 'Hoist Password Reset',
    Title: 'Password Reset',
    Message: [
      "Someone used this email address to request a new password for Hoist.", "To reset your password head here: <a href='" + forgottenPasswordLink + "' style='color:#333333;text-decoration:underline;'>" + forgottenPasswordLink + "</a>.",
      "If this wasn't you, simply ignore this email or hit reply to let us know."
    ],
    Action: {
      Text: "Reset Password &rarr;",
      Link: 'forgottenPassword'
    }
  });
}
export function sendNoUserAcountEmail(address) {
  return sendEmail({
    To: address,
    Subject: 'Someone tried to reset their password on Hoist',
    Title: "Someone tried to reset their password on Hoist",
    Message: ["Someone used this email address to request a new password for Hoist, you don't currently have an account.",
                  "<a href='" + "https://" + config.get('Hoist.domains.portal') + "/signup' style='color:#333333'>Sign up here</a>, if you have any questions feel free to email <a href='mailto:jamie@hoist.io' style='color:#333333'>support@hoist.io</a>.",
                  "If this wasn't you, simply ignore this email or hit reply to let us know."],
    Action: {
      Text: "Sign Up &rarr;",
      Link: "https://" + config.get('Hoist.domains.portal') + "/signup"
    }
  });
}



function sendEmail(emailData) {
  return generateEmailBody(emailData)
    .then((email) => {
      return Object.assign({}, email, {
        From: 'Hoist <hoist@notifications.hoi.io>',
        ReplyTo: 'Hoist <support@hoist.io>'
      });
    })
    .then((em) => {
      return em;
    })
    .then((em) => {
      return postmark.sendAsync(em);
    });
}

function generateEmailBody(emailData) {
  return loadTemplates()
    .then((templates) => {
      emailData = Object.assign({
        blocks: {},
        data: {}
      }, emailData, {
        config: {
          src: `https://${config.get('Hoist.domains.portal')}/`
        }
      })
      return Promise.resolve(Object.assign({}, emailData, {
        HtmlBody: templates.htmlTemplate(emailData),
        TextBody: templates.textTemplate(emailData)
      }));
    });
}
