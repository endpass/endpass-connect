import { identityAPIUrl } from '../support/config';
import { accountList, v3, v3password } from '../../fixtures/identity/accounts';
import { responseSuccess } from '../../fixtures/response';

describe('login', function() {
  describe('connect login features', () => {
    beforeEach(() => {
      cy.visit('http://localhost:4444/#/basic');
      cy.wait(100);
      return cy.authBridgeStart().then(cy.clearMocks);
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

    it('should pass throw apply password form, when already logged in', () => {
      cy.mockAuthCheckOnce(403);
      cy.mockAuthCheckOnce(403);
      cy.mockAuthCheckOnce(403);

      cy.mockRouteOnce({
        url: `${identityAPIUrl}/accounts`,
        method: 'GET',
        status: 200,
        response: accountList,
      });

      cy.mockRouteOnce({
        url: `${identityAPIUrl}/auth/permission`,
        method: 'GET',
        status: 200,
        response: {
          keystore: v3,
        },
      });

      cy.mockRouteOnce({
        url: `${identityAPIUrl}/auth/permission`,
        method: 'POST',
        status: 200,
        response: responseSuccess,
      });

      cy.authBridgeFinish();

      cy.mockLogin();

      cy.get('[data-test=endpass-app-loader]').should('exist');
      cy.getAuthFrame().should('exist');

      cy.getAuthFrame()
        .getIframeElement('[data-test=sign-form]')
        .should('exist');

      cy.getAuthFrame()
        .getIframeElement('input[data-test=password-input]')
        .type(v3password);

      cy.mockButtonSubmit();

      cy.shouldLoggedIn();
    });

    it('should cancel login and close dialog', () => {
      cy.mockAuthCheckOnce(401);

      cy.authBridgeFinish();

      cy.checkMocks();

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

    it('should create new account', () => {
      cy.mockCreateWallet();

      cy.authBridgeFinish();

      cy.get('[data-test=endpass-app-loader]').should('exist');

      cy.getAuthFrame().should('exist');

      // open email form
      cy.getAuthFrame()
        .getIframeElement('[data-test=email-input]')
        .type('dev+e2e_email@endpass.com');

      cy.mockButtonSubmit('[data-test=submit-button-auth]');

      // create new password form
      cy.getAuthFrame()
        .getIframeElement('[data-test=password-main]')
        .type(v3password);

      cy.getAuthFrame()
        .getIframeElement('[data-test=password-confirm]')
        .type(v3password);

      cy.mockButtonSubmit('[data-test=submit-button-create-wallet]');

      cy.mockLogin();
      cy.checkMocks();

      cy.getAuthFrame()
        .getIframeElement('input[type="checkbox"]')
        .click({ force: true });

      cy.getAuthFrame()
        .getIframeElement('[data-test=continue-button]')
        .click();

      cy.getAuthFrame()
        .getIframeElement('input[data-test=password-input]')
        .type(v3password);

      cy.mockButtonSubmit();

      cy.shouldLoggedIn();
    });

    it('should login throw otp', () => {
      cy.mockAuthCheckOnce(401);
      cy.mockAuthCheckOnce(401);

      cy.mockRouteOnce({
        url: `${identityAPIUrl}/auth?redirect_uri=http%3A%2F%2Flocalhost%3A4444%2F%23%2Fbasic`,
        method: 'POST',
        status: 200,
        response: { success: true, challenge: { challengeType: 'otp' } },
      });

      cy.mockRouteOnce({
        url: `${identityAPIUrl}/auth/token`,
        method: 'POST',
        status: 200,
        response: responseSuccess,
      });

      cy.mockAuthCheckOnce(403);
      cy.mockAuthCheckOnce(403);

      cy.mockRouteOnce({
        url: `${identityAPIUrl}/accounts`,
        method: 'GET',
        status: 200,
        response: accountList,
      });
      cy.mockRouteOnce({
        url: `${identityAPIUrl}/accounts`,
        method: 'GET',
        status: 200,
        response: accountList,
      });

      cy.mockAuthCheckOnce(403);

      cy.mockRouteOnce({
        url: `${identityAPIUrl}/auth/permission`,
        method: 'GET',
        status: 200,
        response: {
          keystore: v3,
        },
      });

      cy.mockRouteOnce({
        url: `${identityAPIUrl}/auth/permission`,
        method: 'POST',
        status: 200,
        response: responseSuccess,
      });

      cy.authBridgeFinish();

      cy.mockLogin();
      cy.checkMocks();

      cy.getAuthFrame()
        .getIframeElement('[data-test=email-input]')
        .type('dev+e2e_email@endpass.com');

      cy.mockButtonSubmit('[data-test=submit-button-auth]');

      cy.getAuthFrame()
        .getIframeElement('[data-test=email-input]')
        .type('123456');

      cy.mockButtonSubmit();

      cy.getAuthFrame()
        .getIframeElement('input[data-test=password-input]')
        .type(v3password);

      cy.mockButtonSubmit();
      cy.shouldLoggedIn();
    });

    it('should login throw email', () => {
      cy.mockAuthCheckOnce(401);
      cy.mockAuthCheckOnce(401);
      cy.mockAuthCheckOnce(401);
      cy.mockAuthCheckOnce(403);

      cy.mockRouteOnce({
        url: `${identityAPIUrl}/auth?redirect_uri=http%3A%2F%2Flocalhost%3A4444%2F%23%2Fbasic`,
        method: 'POST',
        status: 200,
        response: { success: true, challenge: { challengeType: 'emailLink' } },
      });

      cy.mockAuthCheckOnce(403);
      cy.mockAuthCheckOnce(403);

      cy.mockRouteOnce({
        url: `${identityAPIUrl}/accounts`,
        method: 'GET',
        status: 200,
        response: accountList,
      });
      cy.mockRouteOnce({
        url: `${identityAPIUrl}/accounts`,
        method: 'GET',
        status: 200,
        response: accountList,
      });

      cy.mockRouteOnce({
        url: `${identityAPIUrl}/auth/permission`,
        method: 'GET',
        status: 200,
        response: {
          keystore: v3,
        },
      });

      cy.mockRouteOnce({
        url: `${identityAPIUrl}/auth/permission`,
        method: 'POST',
        status: 200,
        response: responseSuccess,
      });

      cy.authBridgeFinish();

      cy.mockLogin();
      cy.checkMocks();

      cy.getAuthFrame()
        .getIframeElement('[data-test=email-input]')
        .type('dev+e2e_email@endpass.com');

      cy.mockButtonSubmit('[data-test=submit-button-auth]');

      cy.getAuthFrame()
        .getIframeElement('input[data-test=password-input]')
        .type(v3password);

      cy.mockButtonSubmit();
      cy.shouldLoggedIn();
    });
  });
});
