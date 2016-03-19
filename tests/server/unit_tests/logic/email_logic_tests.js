import * as EmailLogic from '../../../../src/server/logic/emails';
import {
  Client as PostmarkClient
} from 'postmark';
import sinon from 'sinon';
import {
  expect
} from 'chai';

describe("#sendForgottenPasswordEmail", () => {
  before(() => {
    sinon
      .stub(PostmarkClient.prototype, 'send')
      .yields();
    return EmailLogic.sendForgottenPasswordEmail('test@hoi.io', 'ACTIVATIONCODE');
  });
  it('should send correct email', () => {
    return expect(PostmarkClient.prototype.send)
      .to.have.been
      .calledWith(sinon.match((em) => {
        expect(em.From)
          .to.eql('Hoist <hoist@notifications.hoi.io>') &&
          expect(em.ReplyTo)
          .to.eql('Hoist <support@hoist.io>') &&
          expect(em.To)
          .to.eql('test@hoi.io') &&
          expect(em.Subject)
          .to.eql('Hoist Password Reset') &&
          expect(em.TextBody)
          .to.contain('/forgot-password/ACTIVATIONCODE') &&
          expect(em.HtmlBody)
          .to.contain('/forgot-password/ACTIVATIONCODE');
        return true;
      }));
  });
});
