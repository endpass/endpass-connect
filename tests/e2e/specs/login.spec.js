import { email, v3password, mnemonic, regularPassword, otpCode } from '@fixtures/identity/accounts';

describe('login', function() {
  describe('connect login features', () => {
    beforeEach(() => {
      cy.waitPageLoad();
    });

    it('should login to system', () => {
      cy.authFrameContinueRun();

      cy.shouldLoggedIn();
    });

    it('should logout from system', () => {
      cy.mockAuthCheck(200);

      cy.authFrameContinueRun();

      cy.get('[data-test=endpass-app-loader]').should('not.exist');
      cy.get('[data-test=endpass-sign-in-button]').should('not.exist');

      cy.get('[data-test=endpass-form-sign-out-button]').should('exist');
      cy.mockAuthCheck(401);

      cy.get('[data-test=endpass-form-sign-out-button]').click();

      cy.get('[data-test=endpass-app-loader]').should('exist');

      cy.authFramePrepare();
      cy.authFrameContinueRun();

      cy.getElementFromAuth('[data-test=auth-form]').should('exist');
    });

    it('should pass throw apply password form, when already logged in', () => {
      cy.mockAuthCheck(403);

      cy.authFrameContinueRun();

      cy.get('[data-test=endpass-app-loader]').should('exist');
      cy.getElementFromAuth('[data-test=sign-form]').should('exist');

      cy.getElementFromAuth('input[data-test=password-input]').should('exist');
      cy.mockAuthCheck(200);
      cy.getElementFromAuth('input[data-test=password-input]').type(v3password);
      cy.getElementFromAuth('[data-test=submit-button]').click();

      cy.shouldLoggedIn();
    });

    it('should create regular password', () => {
      cy.mockAuthCheck(401);
      cy.mockRegularPasswordCheck(417);

      cy.authFrameContinueRun();

      cy.get('[data-test=endpass-app-loader]').should('exist');

      cy.getElementFromAuth('[data-test=email-input]').type(email);
      cy.getElementFromAuth('[data-test=submit-button-auth]').click();

      cy.getElementFromAuth('[data-test=password-input]').type(regularPassword);
      cy.getElementFromAuth('[data-test=repeat-password-input]').type(regularPassword);
      cy.getElementFromAuth('[data-test=code-input]').type(otpCode);
      cy.getElementFromAuth('[data-test=submit-button]').click();

      cy.getElementFromAuth('[data-test=code-input]').should('exist');
      cy.mockAuthCheck(200);
      cy.mockRegularPasswordCheck();
      cy.getElementFromAuth('[data-test=code-input]').type(otpCode);
      cy.getElementFromAuth('[data-test=submit-button]').click();

      cy.shouldLoggedIn();
    });

    it.skip('should logout, if regular password not exist when sign permission', () => {
      cy.mockAuthCheck(403);
      cy.mockRegularPasswordCheck(417);

      cy.authFrameContinueRun();

      cy.get('[data-test=endpass-app-loader]').should('exist');

      cy.getElementFromAuth('[data-test=email-input]').type(email);
      cy.getElementFromAuth('[data-test=submit-button-auth]').click();

      // submit regular password
      cy.getElementFromAuth('[data-test=password-input]').type(regularPassword);
      cy.getElementFromAuth('[data-test=submit-button]').click();

      cy.getElementFromAuth('[data-test=code-input]').should('exist');
      cy.mockAuthCheck(200);
      cy.mockRegularPasswordCheck();
      cy.getElementFromAuth('[data-test=code-input]').type(otpCode);
      cy.getElementFromAuth('[data-test=submit-button]').click();

      cy.getElementFromAuth('[data-test=password-input]').type(regularPassword);
      cy.getElementFromAuth('[data-test=submit-button]').click();

      cy.shouldLoggedIn();
    });

    it('should cancel login and close dialog', () => {
      cy.mockAuthCheck(401);

      cy.authFrameContinueRun();

      cy.get('[data-test=endpass-app-loader]').should('exist');

      cy.getElementFromAuth('[data-test=modal-card-button-close]').click();

      cy.authFrameWrapperHidden().should('exist');
    });

    it('should create new account', () => {
      cy.mockAuthCheck(401);
      cy.mockAccountsList([]);

      cy.authFrameContinueRun();

      cy.get('[data-test=endpass-app-loader]').should('exist');

      // open email form
      cy.getElementFromAuth('[data-test=email-input]').type(email);
      cy.getElementFromAuth('[data-test=submit-button-auth]').click();

      // submit regular password
      cy.getElementFromAuth('[data-test=password-input]').should('exist');
      cy.mockAuthCheck(403);
      cy.getElementFromAuth('[data-test=password-input]').type(regularPassword);
      cy.getElementFromAuth('[data-test=submit-button]').click();

      // submit email code
      cy.getElementFromAuth('[data-test=code-input]').type(otpCode);
      cy.getElementFromAuth('[data-test=submit-button]').click();

      // permission form
      cy.getElementFromAuth('input[data-test=password-input]').should('exist');
      cy.mockAuthCheck(200);
      cy.getElementFromAuth('input[data-test=password-input]').type(regularPassword);
      cy.getElementFromAuth('[data-test=submit-button]').click();

      // create new wallet form
      cy.getElementFromAuth('[data-test=password-main]').should('exist');
      cy.mockAccountsList();
      cy.getElementFromAuth('[data-test=password-main]').type(v3password);
      cy.getElementFromAuth('[data-test=password-confirm]').type(v3password);
      cy.getElementFromAuth('[data-test=submit-button-wallet-create]').click();

      // apply seed
      cy.getElementFromAuth('input[type="checkbox"]').click({ force: true });
      cy.getElementFromAuth('[data-test=continue-button]').click();

      cy.shouldLoggedIn();
    });

    it('should login throw otp', () => {
      cy.mockAuthCheck(401);

      cy.authFrameContinueRun();

      cy.mockAuthLogin('otp');
      cy.getElementFromAuth('[data-test=email-input]').type(email);
      cy.getElementFromAuth('[data-test=submit-button-auth]').click();

      // submit regular password
      cy.getElementFromAuth('[data-test=password-input]').type(regularPassword);
      cy.getElementFromAuth('[data-test=submit-button]').click();

      cy.getElementFromAuth('[data-test=code-input]').should('exist');
      cy.mockAuthCheck(403);
      cy.getElementFromAuth('[data-test=code-input]').type(otpCode);
      cy.getElementFromAuth('[data-test=submit-button]').click();

      cy.getElementFromAuth('input[data-test=password-input]').type(v3password);
      cy.getElementFromAuth('[data-test=submit-button]').click();

      cy.mockAuthCheck(200);

      cy.shouldLoggedIn();
    });

    it('should login throw email', () => {
      cy.mockAuthCheck(401);

      cy.authFrameContinueRun();

      cy.getElementFromAuth('[data-test=auth-form]').should('exist');

      cy.mockAuthCheck(403);
      cy.getElementFromAuth('[data-test=email-input]').type(email);
      cy.getElementFromAuth('[data-test=submit-button-auth]').click();

      cy.getElementFromAuth('input[data-test=password-input]').type(v3password);
      cy.getElementFromAuth('[data-test=submit-button]').click();

      cy.getElementFromAuth('[data-test=code-input]').type(otpCode);
      cy.getElementFromAuth('[data-test=submit-button]').click();

      // permission submit
      cy.getElementFromAuth('input[data-test=password-input]').should('exist');
      cy.mockAuthCheck(200);
      cy.getElementFromAuth('input[data-test=password-input]').type(v3password);
      cy.getElementFromAuth('[data-test=submit-button]').click();

      cy.shouldLoggedIn();
    });

    it('should recovery account', () => {
      cy.mockAuthCheck(401);

      cy.authFrameContinueRun();

      cy.mockAuthLogin('otp');
      cy.getElementFromAuth('[data-test=email-input]').type(email);
      cy.getElementFromAuth('[data-test=submit-button-auth]').click();

      // submit regular password
      cy.getElementFromAuth('[data-test=password-input]').type(regularPassword);
      cy.getElementFromAuth('[data-test=submit-button]').click();

      cy.getElementFromAuth('[data-test=recovery-link]').click();
      cy.getElementFromAuth('input[data-test=seed-phrase]').type(mnemonic);
      cy.getElementFromAuth('[data-test=submit-button]').click();

      cy.getElementFromAuth('[data-test=cancel-button]').click();

      cy.get('[data-test=endpass-sign-in-button]').should('exist');
      cy.mockAuthCheck(200);
      cy.get('[data-test=endpass-sign-in-button]').click();

      cy.shouldLoggedIn();
    });
  });
});
