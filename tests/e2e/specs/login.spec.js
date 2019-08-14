import { v3password } from '../../fixtures/identity/accounts';

describe('login', function() {
  describe('connect login features', () => {
    beforeEach(() => {
      cy.server();
      return cy.beforePrepares();
    });

    it('should login to system', () => {
      cy.mockInitialData();

      cy.authFrameContinueRun();

      cy.shouldLoggedIn();
    });

    it('should logout from system', () => {
      cy.mockAuthCheck(200);

      cy.mockInitialData();

      cy.authFrameContinueRun();

      cy.get('[data-test=endpass-app-loader]').should('not.exist');
      cy.get('[data-test=endpass-sign-in-button]').should('not.exist');

      cy.mockRouteLogout();
      cy.get('[data-test=endpass-form-sign-out-button]').click();

      cy.mockAuthCheck(401);

      cy.get('[data-test=endpass-sign-in-button]').should('exist');
    });

    it('should pass throw apply password form, when already logged in', () => {
      cy.mockAuthCheck(403);

      cy.mockAccounts();

      cy.authFrameContinueRun();

      cy.get('[data-test=endpass-app-loader]').should('exist');
      cy.authFrameIframe().should('exist');
      cy.authFrame('[data-test=sign-form]').should('exist');

      cy.mockInitialData();
      cy.authFrame('input[data-test=password-input]').type(v3password);
      cy.authFrame('[data-test=submit-button]').click();

      cy.mockAuthCheck(200);

      cy.shouldLoggedIn();
    });

    it('should cancel login and close dialog', () => {
      cy.mockAuthCheck(401);

      cy.authFrameContinueRun();

      cy.get('[data-test=endpass-app-loader]').should('exist');
      cy.authFrameIframe().should('exist');

      cy.authFrame('[data-test=modal-card-button-close]').click();

      cy.authFrameWrapperHidden().should('exist');
    });

    it('should create new account', () => {
      cy.mockAuthCheck(401);

      cy.authFrameContinueRun();

      cy.get('[data-test=endpass-app-loader]').should('exist');
      cy.authFrameIframe().should('exist');

      // open email form
      cy.mockAuthUser('emailLink');
      cy.authFrame('[data-test=email-input]').type('dev+e2e_email@endpass.com');
      cy.authFrame('[data-test=submit-button-auth]').click();

      // create new password form
      cy.mockAuthCheck(403);
      cy.mockAccountsList([]);
      cy.mockAccountUpdate();
      cy.authFrame('[data-test=password-main]').type(v3password);
      cy.authFrame('[data-test=password-confirm]').type(v3password);
      cy.authFrame('[data-test=submit-button-create-wallet]').click();

      // apply seed
      cy.mockAuthCheck(403);
      cy.mockAccounts();
      cy.mockUserSeed();
      cy.mockSettings();
      cy.authFrame('input[type="checkbox"]').click({ force: true });
      cy.authFrame('[data-test=continue-button]').click();

      cy.mockAuthCheck(403);
      cy.mockAuthPermission();
      cy.authFrame('input[data-test=password-input]').type(v3password);
      cy.authFrame('[data-test=submit-button]').click();

      cy.mockAuthCheck(200);

      cy.shouldLoggedIn();
    });

    it('should login throw otp', () => {
      cy.mockAuthCheck(401);

      cy.authFrameContinueRun();

      cy.mockAuthUser('otp');
      cy.authFrame('[data-test=email-input]').type('dev+e2e_email@endpass.com');
      cy.authFrame('[data-test=submit-button-auth]').click();

      cy.mockAuthCheck(403);
      cy.authFrame('[data-test=email-input]').type('123456');
      cy.authFrame('[data-test=submit-button]').click();

      cy.mockAuthCheck(403);
      cy.mockAccounts();
      cy.mockSettings();
      cy.mockAuthPermission();
      cy.authFrame('input[data-test=password-input]').type(v3password);
      cy.authFrame('[data-test=submit-button]').click();

      cy.mockAuthCheck(200);

      cy.shouldLoggedIn();
    });

    it('should login throw email', () => {
      cy.mockAuthCheck(401);

      cy.authFrameContinueRun();

      cy.mockAuthUser('emailLink');
      cy.authFrame('[data-test=email-input]').type('dev+e2e_email@endpass.com');
      cy.authFrame('[data-test=submit-button-auth]').click();

      cy.mockAuthCheck(403);
      cy.mockAccounts();
      cy.mockSettings();
      cy.mockAuthPermission();
      cy.authFrame('input[data-test=password-input]').type(v3password);
      cy.authFrame('[data-test=submit-button]').click();

      cy.mockAuthCheck(200);

      cy.shouldLoggedIn();
    });
  });
});
