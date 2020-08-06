import { email, password, otpCode } from '@fixtures/identity/user';
import { authUrl } from '@config';

describe('login', () => {
  describe('connect login features', () => {
    beforeEach(() => {
      cy.waitPageLoad();
    });

    it('should pass through login form, when already logged in', () => {
      cy.mockAuthCheck(200);
      cy.authFrameContinueRun();

      cy.mockOnceOauthState();

      cy.get('[data-test=login-element] button')
        .first()
        .click();

      cy.shouldLoggedIn();
    });

    it('should show sign up form if user trying to login from missed account', () => {
      cy.mockAuthCheck(401);
      cy.authFrameContinueRun();
      cy.mockOnceOauthStateForSignIn();

      cy.wait('@routeAuthCheck');

      cy.get('[data-test=login-element] button')
        .first()
        .click();

      cy.getElementFromAuth('[data-test=email-input]').type(email);
      cy.getElementFromAuth('[data-test=submit-button-auth]').click();

      cy.wait('@routeLoginAuthPost');

      cy.wait(1000);

      cy.getElementFromAuth('[data-test=submit-button-auth]').should(
        'contain.text',
        'Sign up',
      );
    });

    it('should recover password', () => {
      cy.mockAuthCheck(401);
      cy.authFrameContinueRun();
      cy.mockOnceOauthStateForSignIn();
      cy.mockAuthLoginForExistingUser();

      cy.wait('@routeAuthCheck');

      cy.get('[data-test=login-element] button')
        .first()
        .click();

      cy.getElementFromAuth('[data-test=email-input]').type(email);
      cy.getElementFromAuth('[data-test=submit-button-auth]').click();

      cy.getElementFromAuth('[data-test=password-recover]').click();

      cy.wait(1000);

      cy.getElementFromAuth('[data-test=password-input]')
        .focus()
        .type(password);
      cy.getElementFromAuth('[data-test=repeat-password-input]').type(
        password,
        { force: true },
      );

      cy.getElementFromAuth('[data-test=code-input]').type(otpCode, {
        force: true,
      });
      cy.getElementFromAuth('[data-test=submit-button]').click();

      cy.wait('@routeAuthSendCode');

      cy.mockAuthCheck(200);
      cy.mockOauthConsentForSkip();

      cy.getElementFromAuth('[data-test=code-input]').type(otpCode, {
        force: true,
      });
      cy.getElementFromAuth('[data-test=submit-button]').click();

      cy.wait('@routeAuthSendCode');

      cy.getElementFromAuth('[data-test=code-input]').type(otpCode, {
        force: true,
      });
      cy.getElementFromAuth('[data-test=submit-button]').click();

      cy.wait('@routeAuthCheck');

      cy.shouldLoggedIn();
    });

    it('should sign up if user not exist, then login successfully', () => {
      cy.mockAuthCheck(401);
      cy.authFrameContinueRun();
      cy.mockOnceOauthStateForSignIn();

      cy.wait('@routeAuthCheck');

      cy.get('[data-test=login-element] button')
        .first()
        .click();

      cy.wait('@routeAuthCheck');

      cy.getElementFromAuth('[data-test=switch-to-sign-up]').click();

      cy.wait(1000);

      cy.getElementFromAuth('[data-test=email-input]').type(email);
      cy.getElementFromAuth('[data-test=password-input]').type(password, {
        force: true,
      });
      cy.getElementFromAuth('[data-test=confirm-password-input]').type(
        password,
        { force: true },
      );

      cy.getElementFromAuth('[data-test=submit-button-auth]').click();

      cy.wait('@routeAuthSendCode');

      cy.mockAuthCheck(200);

      cy.mockOauthConsentRedirectToConfirmation();

      cy.getElementFromAuth('[data-test=code-input]').type(otpCode, {
        force: true,
      });
      cy.getElementFromAuth('[data-test=submit-button]').click();

      cy.getElementFromAuth('[data-test=code-input]').type(otpCode, {
        force: true,
      });
      cy.getElementFromAuth('[data-test=submit-button]').click();

      cy.wait(1000);

      cy.getElementFromAuth('[data-test=submit-button]').click();

      cy.wait('@routeAuthCheck');

      cy.shouldLoggedIn();
    });

    it('should login in without consent, if was logged in earlier', () => {
      cy.mockAuthCheck(401);
      cy.authFrameContinueRun();
      cy.mockOnceOauthStateForSignIn();
      cy.mockAuthLoginForExistingUser();

      cy.wait('@routeAuthCheck');

      cy.get('[data-test=login-element] button')
        .first()
        .click();

      cy.getElementFromAuth('[data-test=email-input]').type(email);
      cy.getElementFromAuth('[data-test=submit-button-auth]').click();

      cy.getElementFromAuth('[data-test=password-input]').type(password);

      cy.getElementFromAuth('[data-test=submit-button]').click();

      cy.wait('@routeAuthSendCode');

      cy.mockAuthCheck(200);

      cy.mockOauthConsentForSkip();

      cy.getElementFromAuth('[data-test=code-input]').type(otpCode, {
        force: true,
      });
      cy.getElementFromAuth('[data-test=submit-button]').click();

      cy.getElementFromAuth('[data-test=code-input]').type(otpCode, {
        force: true,
      });
      cy.getElementFromAuth('[data-test=submit-button]').click();

      cy.wait('@routeAuthCheck');

      cy.shouldLoggedIn();
    });

    it('should logout from system', () => {
      cy.mockAuthCheck(200);
      cy.authFrameContinueRun();

      cy.shouldLoggedIn();

      cy.wait('@routeAuthCheck');

      cy.shouldLogout(() => cy.get('.header-controls-logout').click());
    });
  });
});
