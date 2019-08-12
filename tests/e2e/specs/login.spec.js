import { identityAPIUrl } from '../support/config';
import { accountList, v3password } from '../../fixtures/identity/accounts';
import { responseSuccess } from '../../fixtures/response';

describe('login', function() {
  describe('connect login features', () => {
    beforeEach(() => {
      cy.visit('http://localhost:4444/#/basic');
      cy.wait(100);
      return cy.authBridgeStart().then(cy.clearMocks);
    });

    it('should show apply password form', () => {
      cy.mockRoute({
        url: `${identityAPIUrl}/auth/check`,
        method: 'GET',
        status: 403,
        response: {},
      });

      cy.mockRoute({
        url: `${identityAPIUrl}/accounts`,
        method: 'GET',
        status: 200,
        response: accountList,
      });

      cy.authBridgeFinish();

      cy.get('[data-test=endpass-app-loader]').should('exist');
      cy.getAuthFrame().should('exist');

      cy.getAuthFrame()
        .getIframeElement('[data-test=sign-form]')
        .should('exist');
    });

    it('should cancel login on dialog close', () => {
      cy.mockRoute({
        url: `${identityAPIUrl}/auth/check`,
        method: 'GET',
        status: 401,
        response: {},
      });
      cy.authBridgeFinish();

      cy.get('[data-test=endpass-app-loader]').should('exist');
      cy.getAuthFrame().should('exist');

      cy.getAuthFrame()
        .getIframeElement('[data-test=modal-card-button-close]')
        .click();

      cy.authWrapperHidden().should('exist');
    });

    it('should login to system', () => {
      cy.mockLogin();

      cy.authBridgeFinish();

      cy.shouldLoggedIn();
    });

    it('should logout from system', () => {
      cy.mockLogin();

      cy.mockRoute({
        url: `${identityAPIUrl}/logout`,
        method: 'POST',
        status: 200,
        response: responseSuccess,
      });

      cy.authBridgeFinish();

      cy.get('[data-test=endpass-app-loader]').should('not.exist');
      cy.get('[data-test=endpass-sign-in-button]').should('not.exist');

      cy.get('[data-test=endpass-form-sign-out-button]').click();

      cy.get('[data-test=endpass-sign-in-button]').should('exist');
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

      cy.mockLogin();

      cy.getAuthFrame()
        .getIframeElement('input[type="checkbox"]')
        .click({ force: true });

      cy.getAuthFrame()
        .getIframeElement('[data-test=continue-button]')
        .click();

      cy.getAuthFrame()
        .getIframeElement('input[data-test=password-input]')
        .type(v3password);

      cy.getAuthFrame()
        .getIframeElement('[data-test=submit-button]')
        .click();

      cy.shouldLoggedIn();
    });
  });
});
