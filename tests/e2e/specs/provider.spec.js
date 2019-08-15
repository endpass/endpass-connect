import { v3password, address } from '@fixtures/identity/accounts';
import {
  messageToSign,
  messageSignature,
  messagePersonalSignature,
} from '@fixtures/web3/message';

describe('provider', function() {
  describe('web3 provider features', () => {
    beforeEach(() => {
      cy.waitPageLoad();
    });

    it('web3.eth.sign', () => {
      cy.authFrameContinueRun();
      cy.shouldLoggedIn();

      cy.get('[data-test=endpass-form-message-input]').type(messageToSign);
      cy.get('[data-test=endpass-form-sign-button]').click();
      cy.getElementFromAuth('[data-test=sign-form]').should('exist');
      cy.getElementFromAuth('[data-test=password-input]').type(v3password);
      cy.getElementFromAuth('[data-test=submit-button]').click();
      cy.authFrameWrapperHidden().should('exist');
      cy.get('[data-test=endpass-form-signature-input]').should(
        'have.value',
        messageSignature,
      );
    });

    it('web3.eth.personal.sign and web3.eth.personal.ecRecover', () => {
      cy.authFrameContinueRun();
      cy.shouldLoggedIn();

      cy.get('[data-test=endpass-form-message-input]').type(messageToSign);
      cy.get('[data-test=endpass-form-personal-sign-button]').click();
      cy.getElementFromAuth('[data-test=sign-form]').should('exist');
      cy.getElementFromAuth('[data-test=password-input]').type(v3password);
      cy.getElementFromAuth('[data-test=submit-button]').click();
      cy.authFrameWrapperHidden().should('exist');
      cy.get('[data-test=endpass-form-signature-input]').should(
        'have.value',
        messagePersonalSignature,
      );

      // Address recovering
      cy.get('[data-test=endpass-form-personal-recover-button]').click();
      cy.get('[data-test=endpass-form-basic-active-account]').then($el => {
        cy.get('[data-test=app-notification]').contains($el.text());
      });
    });
  });
});
