import { address, email, v3password } from '@fixtures/identity/accounts';
import { authUrl, visitUrl, visitBlockOauth } from '@config';

describe('oauth', function() {
  describe('oauth popup window', () => {
    beforeEach(() => {
      cy.server();
      cy.mockAuthCheck(401);
    });

    it('should login by oauth flow', () => {
      const consentUrl = 'login?login_challenge=login_challenge';
      const url = `public/${consentUrl}`;

      cy.visit(`${authUrl}${url}`);
      cy.mockInitialData();
      cy.mockAuthLogin('otp', `${authUrl}${url}`);

      cy.get('[data-test=email-input]').type(email);
      cy.get('[data-test=submit-button-auth]').click();

      cy.mockAuthCheck(403);
      cy.get('[data-test=code-input]').type('123456');
      cy.get('[data-test=submit-button]').click();

      cy.mockAuthCheck(200);
      cy.mockOauthConsent(consentUrl, {
        skip: false,
        request_url: '',
        requested_scope: ['wallet:accounts:read'],
      });
      cy.get('input[data-test=password-input]').type(v3password);
      cy.get('[data-test=submit-button]').click();

      cy.get('[data-test=scopes-tree]').should('exist');
      cy.mockAuthCheck(401);
      cy.get('[data-test=submit-button]').click();

      cy.get('[data-test=submit-button-auth]').should('exist');
    });
  });

  describe('oauth login and get data', () => {
    beforeEach(() => {
      cy.visit(`${visitUrl}${visitBlockOauth}`, {
        onBeforeLoad(win) {
          cy.stub(win, 'open', args => {
            const state = args
              .split('&')
              .find(el => el.search('state=') === 0)
              .split('=')[1];

            return {
              closed: false,
              location: {
                hash: '',
                search: `state=${state}&code=code`,
              },
            };
          });
        },
      });
      cy.preparePage();
    });

    it('should show accounts list', () => {
      cy.authFrameContinueRun();

      cy.get('[data-test=endpass-oauth-get-accounts-button]').click();

      cy.window()
        .its('open')
        .should('be.called');

      cy.get('[data-test=endpass-app-loader]').should('not.exist');
      cy.authFrameWrapperHidden().should('exist');
      cy.get('[data-test=endpass-oauth-accounts-list]')
        .eq(0)
        .should('contain.text', address);
    });

    it('should show account email', () => {
      cy.authFrameContinueRun();

      cy.get('[data-test=endpass-oauth-get-email-button]').click();

      cy.window()
        .its('open')
        .should('be.called');

      cy.get('[data-test=endpass-app-loader]').should('not.exist');
      cy.authFrameWrapperHidden().should('exist');
      cy.get('[data-test=endpass-oauth-user-email]').should(
        'contain.text',
        email,
      );
    });
  });
});
