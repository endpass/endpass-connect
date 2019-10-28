import {
  email,
  v3password,
  mnemonic,
  regularPassword,
  otpCode,
} from '@fixtures/identity/accounts';

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

      cy.shouldLoggedIn();

      cy.wait('@routeAuthCheck');

      cy.get('[data-test=endpass-form-sign-out-button]').should('exist');
      cy.mockAuthCheck(401);

      cy.get('[data-test=endpass-form-sign-out-button]').click();

      cy.wait('@routeAuthCheck');

      cy.shouldLogout();

      cy.authFramePrepare();
      cy.authFrameContinueRun();

      cy.getElementFromAuth('[data-test=auth-form]').should('exist');
    });

    it('should pass throw apply password form, when already logged in', () => {
      cy.mockAuthCheck(403);

      cy.authFrameContinueRun();

      cy.wait('@routeAuthCheck');

      cy.get('[data-test=endpass-app-loader]').should('exist');
      cy.getElementFromAuth('[data-test=sign-form]').should('exist');

      cy.getElementFromAuth('input[data-test=password-input]').type(
        regularPassword,
      );
      cy.mockAuthCheck(200);
      cy.getElementFromAuth('[data-test=submit-button]').click();

      cy.wait('@routeAuthPermissionPost');
      cy.wait('@routeAuthCheck');

      cy.shouldLoggedIn();
    });

    it('should create regular password', () => {
      cy.mockAuthCheck(401);
      cy.mockRegularPasswordCheck(417);

      cy.authFrameContinueRun();

      cy.get('[data-test=endpass-app-loader]').should('exist');

      cy.wait('@routeAuthCheck');
      cy.getElementFromAuth('[data-test=email-input]').type(email);
      cy.getElementFromAuth('[data-test=submit-button-auth]').click();

      cy.wait('@routeRegularPasswordCheck');
      cy.getElementFromAuth('[data-test=password-input]').type(regularPassword);
      cy.getElementFromAuth('[data-test=repeat-password-input]').type(
        regularPassword,
      );
      cy.getElementFromAuth('[data-test=code-input]').type(otpCode);
      cy.getElementFromAuth('[data-test=submit-button]').click();

      cy.wait('@routeAuthSendCode');
      cy.getElementFromAuth('[data-test=code-input]').type(otpCode);
      cy.mockAuthCheck(200);
      cy.mockRegularPasswordCheck();
      cy.getElementFromAuth('[data-test=submit-button]').click();

      cy.wait('@routeAuthCheck');

      cy.shouldLoggedIn();
    });

    it('should create regular password if not exist, when sign permission was called', () => {
      cy.mockAuthCheck(403);
      cy.mockRegularPasswordCheck(417);

      cy.authFrameContinueRun();

      cy.get('[data-test=endpass-app-loader]').should('exist');

      cy.wait('@routeRegularPasswordCheck');

      cy.getElementFromAuth('[data-test=password-input]').type(regularPassword);
      cy.getElementFromAuth('[data-test=repeat-password-input]').type(
        regularPassword,
      );
      cy.getElementFromAuth('[data-test=code-input]').type(otpCode);
      cy.mockRegularPasswordCheck(200);
      cy.getElementFromAuth('[data-test=submit-button]').click();

      cy.wait('@routeRegularPasswordResetConfirm');
      cy.wait('@routeAuthPermissionPost');
      cy.wait('@routeAuthCheck');
      cy.wait('@routeRegularPasswordCheck');
      cy.wait('@routeRegularPasswordReset');

      cy.getElementFromAuth('[data-test=password-input]').type(regularPassword);
      cy.mockAuthCheck(200);
      cy.getElementFromAuth('[data-test=submit-button]').click();

      cy.shouldLoggedIn();
    });

    it('should cancel login and close dialog', () => {
      cy.mockAuthCheck(401);

      cy.authFrameContinueRun();

      cy.wait('@routeAuthCheck');
      cy.wait('@routeAuthCheck');

      cy.get('[data-test=endpass-app-loader]').should('exist');

      cy.getElementFromAuth('[data-test=modal-card-button-close]').click();

      cy.authFrameWrapperHidden().should('exist');
    });

    it('should create new account', () => {
      cy.mockAuthCheck(401);
      cy.mockAccountsList([]);

      cy.authFrameContinueRun();

      cy.get('[data-test=endpass-app-loader]').should('exist');

      cy.wait('@routeAuthCheck');

      // open email form
      cy.getElementFromAuth('[data-test=email-input]').type(email);
      cy.getElementFromAuth('[data-test=submit-button-auth]').click();

      // submit regular password
      cy.wait('@routeRegularPasswordCheck');
      cy.getElementFromAuth('[data-test=password-input]').type(regularPassword);
      cy.mockAuthCheck(403);
      cy.getElementFromAuth('[data-test=submit-button]').click();

      cy.wait('@routeAuthSendCode');

      // submit email code
      cy.getElementFromAuth('[data-test=code-input]').type(otpCode);
      cy.getElementFromAuth('[data-test=submit-button]').click();

      cy.wait('@routeLoginAuthToken');
      cy.wait('@routeAuthCheck');

      // permission form
      cy.getElementFromAuth('input[data-test=password-input]').type(
        regularPassword,
      );
      cy.mockAuthCheck(200);
      cy.getElementFromAuth('[data-test=submit-button]').click();

      cy.wait('@routeAuthPermissionPost');
      cy.wait('@routeAuthCheck');
      cy.wait('@routeAccountsList');
      cy.wait('@routeAuthCheck');

      // create new wallet form
      cy.mockAccountsList();
      cy.getElementFromAuth('[data-test=password-main]').should('exist');
      cy.wait('@routeAuthCheck');

      cy.getElementFromAuth('[data-test=password-main]').type(v3password);
      cy.getElementFromAuth('[data-test=password-confirm]').type(v3password);
      cy.getElementFromAuth('[data-test=submit-button-wallet-create]').click();

      cy.wait('@routeAccountUpdate');

      // apply seed
      cy.getElementFromAuth('input[type="checkbox"]').click({ force: true });
      cy.getElementFromAuth('[data-test=continue-button]').click();

      cy.wait('@routeAccountsList');

      cy.shouldLoggedIn();
    });

    it('should login throw otp', () => {
      cy.mockAuthCheck(401);

      cy.authFrameContinueRun();

      cy.wait('@routeAuthCheck');

      cy.getElementFromAuth('[data-test=email-input]').type(email);
      cy.mockAuthLogin('otp');
      cy.getElementFromAuth('[data-test=submit-button-auth]').click();

      cy.wait('@routeRegularPasswordCheck');

      // submit regular password
      cy.getElementFromAuth('[data-test=password-input]').type(regularPassword);
      cy.getElementFromAuth('[data-test=submit-button]').click();

      cy.getElementFromAuth('[data-test=code-input]').should('exist');
      cy.getElementFromAuth('[data-test=code-input]').type(otpCode);
      cy.mockAuthCheck(403);
      cy.getElementFromAuth('[data-test=submit-button]').click();

      cy.wait('@routeAuthCheck');
      cy.wait('@routeRegularPasswordCheck');

      cy.getElementFromAuth('input[data-test=password-input]').type(
        regularPassword,
      );
      cy.mockAuthCheck(200);
      cy.getElementFromAuth('[data-test=submit-button]').click();

      cy.wait('@routeAuthPermissionPost');
      cy.wait('@routeAuthCheck');

      cy.shouldLoggedIn();
    });

    it('should login throw email', () => {
      cy.mockAuthCheck(401);

      cy.authFrameContinueRun();

      cy.wait('@routeAuthCheck');
      cy.wait('@routeAuthCheck');

      cy.getElementFromAuth('[data-test=auth-form]').should('exist');

      cy.getElementFromAuth('[data-test=email-input]').type(email);
      cy.mockAuthCheck(403);
      cy.getElementFromAuth('[data-test=submit-button-auth]').click();

      cy.wait('@routeRegularPasswordCheck');

      cy.getElementFromAuth('input[data-test=password-input]').type(
        regularPassword,
      );
      cy.getElementFromAuth('[data-test=submit-button]').click();

      cy.wait('@routeAuthSendCode');

      cy.getElementFromAuth('[data-test=code-input]').type(otpCode);
      cy.getElementFromAuth('[data-test=submit-button]').click();

      cy.wait('@routeLoginAuthToken');
      cy.wait('@routeAuthCheck');
      cy.wait('@routeRegularPasswordCheck');

      // permission submit
      cy.getElementFromAuth('input[data-test=password-input]').type(
        regularPassword,
      );
      cy.mockAuthCheck(200);
      cy.getElementFromAuth('[data-test=submit-button]').click();

      cy.wait('@routeAuthPermissionPost');

      cy.shouldLoggedIn();
    });

    it.skip('should forgot your password', () => {
      // TODO add forgot password test
    });

    it.skip('should recovery otp by sms', () => {
      // TODO change from seed to sms
      cy.mockAuthCheck(401);

      cy.authFrameContinueRun();

      cy.getElementFromAuth('[data-test=email-input]').type(email);
      cy.mockAuthLogin('otp');
      cy.getElementFromAuth('[data-test=submit-button-auth]').click();

      // submit regular password
      cy.getElementFromAuth('[data-test=password-input]').type(regularPassword);
      cy.getElementFromAuth('[data-test=submit-button]').click();

      cy.getElementFromAuth('[data-test=code-input]').type(otpCode);
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
