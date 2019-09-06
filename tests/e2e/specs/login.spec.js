import { email, v3password, mnemonic } from '@fixtures/identity/accounts';

describe('login', function() {
  describe('connect login features', () => {
    beforeEach(() => {
      cy.waitPageLoad();
    });

    it.only('should login to system', () => {
      cy.authFrameContinueRun();

      cy.shouldLoggedIn();
    });

    it('should logout from system', () => {
      cy.mockAuthCheck(200);

      cy.authFrameContinueRun();

      cy.get('[data-test=endpass-app-loader]').should('not.exist');
      cy.get('[data-test=endpass-sign-in-button]').should('not.exist');

      cy.mockAuthCheck(401);

      cy.get('[data-test=endpass-form-sign-out-button]').click();

      cy.get('[data-test=endpass-sign-in-button]').should('exist');
    });

    it('should pass throw apply password form, when already logged in', () => {
      cy.mockAuthCheck(403);

      cy.authFrameContinueRun();

      cy.get('[data-test=endpass-app-loader]').should('exist');
      cy.getElementFromAuth('[data-test=sign-form]').should('exist');

      cy.mockAuthCheck(200);
      cy.getElementFromAuth('input[data-test=password-input]').type(v3password);
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

      cy.authFrameContinueRun();

      cy.get('[data-test=endpass-app-loader]').should('exist');

      // open email form
      cy.getElementFromAuth('[data-test=email-input]').type(email);
      cy.getElementFromAuth('[data-test=submit-button-auth]').click();

      // create new password form
      cy.mockAuthCheck(403);
      cy.mockAccountsList([]);
      cy.getElementFromAuth('[data-test=password-main]').type(v3password);
      cy.getElementFromAuth('[data-test=password-confirm]').type(v3password);
      cy.getElementFromAuth('[data-test=submit-button-create-wallet]').click();

      // apply seed
      cy.mockAuthCheck(403);
      cy.mockAccountsList();
      cy.getElementFromAuth('input[type="checkbox"]').click({ force: true });
      cy.getElementFromAuth('[data-test=continue-button]').click();

      cy.mockAuthCheck(403);
      cy.getElementFromAuth('input[data-test=password-input]').type(v3password);
      cy.getElementFromAuth('[data-test=submit-button]').click();

      cy.mockAuthCheck(200);

      cy.shouldLoggedIn();
    });

    it('should login throw otp', () => {
      cy.mockAuthCheck(401);

      cy.authFrameContinueRun();

      cy.mockAuthLogin('otp');
      cy.getElementFromAuth('[data-test=email-input]').type(email);
      cy.getElementFromAuth('[data-test=submit-button-auth]').click();

      cy.mockAuthCheck(403);
      cy.getElementFromAuth('[data-test=code-input]').type('123456');
      cy.getElementFromAuth('[data-test=submit-button]').click();

      cy.mockAuthCheck(403);
      cy.getElementFromAuth('input[data-test=password-input]').type(v3password);
      cy.getElementFromAuth('[data-test=submit-button]').click();

      cy.mockAuthCheck(200);

      cy.shouldLoggedIn();
    });

    it('should login throw email', () => {
      cy.mockAuthCheck(401);

      cy.authFrameContinueRun();

      cy.getElementFromAuth('[data-test=email-input]').type(email);
      cy.getElementFromAuth('[data-test=submit-button-auth]').click();

      cy.mockAuthCheck(403);
      cy.getElementFromAuth('input[data-test=password-input]').type(v3password);
      cy.getElementFromAuth('[data-test=submit-button]').click();

      cy.mockAuthCheck(200);

      cy.shouldLoggedIn();
    });

    it('should recovery account', () => {
      cy.mockAuthCheck(401);

      cy.authFrameContinueRun();

      cy.mockAuthLogin('otp');
      cy.getElementFromAuth('[data-test=email-input]').type(email);
      cy.getElementFromAuth('[data-test=submit-button-auth]').click();

      cy.mockAuthCheck(401);
      cy.getElementFromAuth('[data-test=recovery-link]').click();
      cy.getElementFromAuth('input[data-test=seed-phrase]').type(mnemonic);
      cy.getElementFromAuth('[data-test=submit-button]').click();

      cy.getElementFromAuth('[data-test=cancel-button]').click();

      cy.mockAuthCheck(200);
      cy.get('[data-test=endpass-sign-in-button]').click();

      cy.shouldLoggedIn();
    });
  });
});
