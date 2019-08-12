import { identityAPIUrl } from '../support/config';
import { v3password } from '../../fixtures/identity/accounts';

describe('login', function() {
  describe('connect login features', () => {
    beforeEach(() => {
      return cy.beforePrepares();
    });

    it('should logout from system', () => {
      cy.mockInitialData();

      cy.authFrameContinueRun();

      cy.get('[data-test=endpass-app-loader]').should('not.exist');
      cy.get('[data-test=endpass-sign-in-button]').should('not.exist');

      cy.mockRouteLogout();
      cy.get('[data-test=endpass-form-sign-out-button]').click();

      cy.get('[data-test=endpass-sign-in-button]').should('exist');
    });

    it('should pass throw apply password form, when already logged in', () => {
      cy.mockAuthCheckOnce(403);
      cy.mockAuthCheckOnce(403);
      cy.mockAuthCheckOnce(403);

      cy.mockAccounts();

      cy.authFrameContinueRun();

      cy.mockInitialData();

      cy.get('[data-test=endpass-app-loader]').should('exist');
      cy.authFrameIframe().should('exist');

      cy.authFrame('[data-test=sign-form]').should('exist');

      cy.authFrame('input[data-test=password-input]').type(v3password);

      cy.authFrame('[data-test=submit-button]').click();

      cy.shouldLoggedIn();
    });

    it('should cancel login and close dialog', () => {
      cy.mockAuthCheckOnce(401);

      cy.authFrameContinueRun();

      cy.checkMocks();

      cy.get('[data-test=endpass-app-loader]').should('exist');
      cy.authFrameIframe().should('exist');

      cy.authFrame('[data-test=modal-card-button-close]').click();

      cy.authFrameWrapperHidden().should('exist');
    });

    it('should login to system', () => {
      cy.mockInitialData();

      cy.authFrameContinueRun();

      cy.shouldLoggedIn();
    });

    it('should create new account', () => {
      cy.mockAuthCheckOnce(401);
      cy.mockAuthCheckOnce(401);
      cy.mockAuthUser('emailLink');
      cy.mockAuthCheckOnce(403);

      cy.mockRouteOnce({
        url: `${identityAPIUrl}/accounts`,
        method: 'GET',
        status: 200,
        response: [],
      });

      cy.mockUserSeed();
      cy.mockSettings();
      cy.mockRouteOnce({
        url: `${identityAPIUrl}/account`,
        method: 'POST',
        status: 403,
        response: {},
      });

      // seed phrase dialog
      cy.mockAccounts();

      cy.mockAuthCheckOnce(403);

      cy.mockInitialData();
      cy.checkMocks();

      cy.authFrameContinueRun();

      cy.get('[data-test=endpass-app-loader]').should('exist');
      cy.authFrameIframe().should('exist');

      // open email form
      cy.authFrame('[data-test=email-input]').type('dev+e2e_email@endpass.com');
      cy.authFrame('[data-test=submit-button-auth]').click();

      // create new password form
      cy.authFrame('[data-test=password-main]').type(v3password);
      cy.authFrame('[data-test=password-confirm]').type(v3password);
      cy.authFrame('[data-test=submit-button-create-wallet]').click();

      cy.authFrame('input[type="checkbox"]').click({ force: true });
      cy.authFrame('[data-test=continue-button]').click();

      cy.authFrame('input[data-test=password-input]').type(v3password);
      cy.authFrame('[data-test=submit-button]').click();

      cy.shouldLoggedIn();
    });

    it('should login throw otp', () => {
      cy.mockAuthCheckOnce(401);
      cy.mockAuthCheckOnce(401);

      cy.mockAuthUser('otp');

      cy.mockAuthCheckOnce(403);
      cy.mockAuthCheckOnce(403);
      cy.mockAuthCheckOnce(403);

      cy.mockAccounts();

      cy.authFrameContinueRun();

      cy.mockInitialData();
      cy.checkMocks();

      cy.authFrame('[data-test=email-input]').type('dev+e2e_email@endpass.com');

      cy.authFrame('[data-test=submit-button-auth]').click();

      cy.authFrame('[data-test=email-input]').type('123456');

      cy.authFrame('[data-test=submit-button]').click();

      cy.authFrame('input[data-test=password-input]').type(v3password);

      cy.authFrame('[data-test=submit-button]').click();
      cy.shouldLoggedIn();
    });

    it('should login throw email', () => {
      cy.mockAuthCheckOnce(401);
      cy.mockAuthCheckOnce(401);
      cy.mockAuthCheckOnce(401);
      cy.mockAuthCheckOnce(403);

      cy.mockAuthUser('emailLink');

      cy.mockAuthCheckOnce(403);
      cy.mockAuthCheckOnce(403);

      cy.mockAccounts();

      cy.authFrameContinueRun();

      cy.mockInitialData();
      cy.checkMocks();

      cy.authFrame('[data-test=email-input]').type('dev+e2e_email@endpass.com');

      cy.authFrame('[data-test=submit-button-auth]').click();

      cy.authFrame('input[data-test=password-input]').type(v3password);

      cy.authFrame('[data-test=submit-button]').click();
      cy.shouldLoggedIn();
    });
  });
});
