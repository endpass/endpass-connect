import {
  accountList,
  address, v3,
  v3password,
} from '../../fixtures/identity/accounts';
import { identityAPIUrl } from '../support/config';
import { responseSuccess } from '../../fixtures/response';
import settings from '../../fixtures/identity/settings';

describe('await', function() {
  describe('connect login features', () => {
    beforeEach(() => {
      cy.visit('http://localhost:4444/#/basic');
      cy.wait(100);
      return cy.authBridgeStart().then(cy.clearMocks);
    });

    it('should create new account', () => {
      cy.mockCreateWallet();

      cy.authBridgeFinish();

      cy.get('[data-test=endpass-app-loader]').should('exist');

      cy.getAuthFrame().should('exist');


      // open email form
      cy.getAuthFrame()
        .getIframeElement('[data-test=email-input]')
        .type('dev+e2e_email@endpass.com');
      cy.getAuthFrame()
        .getIframeElement('[data-test=submit-button-auth]')
        .click();

      cy.wait(200);

      // create new password form
      // TODO: change selectors to data-test selectors
      cy.getAuthFrame()
        .getIframeElement('[data-vv-name=password]')
        .type(v3password);

      cy.getAuthFrame()
        .getIframeElement('[data-vv-name=passwordConfirm]')
        .type(v3password);

      cy.getAuthFrame()
        .getIframeElement('[data-test=submit-button-create-wallet]')
        .click();

      cy.wait(2000);

      cy.getAuthFrame()
        .getIframeElement('input[type="checkbox"]')
        .check();

      cy.wait(200);

      cy.getAuthFrame()
        .getIframeElement('[data-test=button-continue]')
        .click();

      cy.mockLogin();

      cy.getAuthFrame()
        .getIframeElement('[data-test=password-input]')
        .type(v3password);

      cy.getAuthFrame()
        .getIframeElement('[data-test=submit-button]')
        .click();

      cy.shouldLoggedIn();
    });
  });
});
