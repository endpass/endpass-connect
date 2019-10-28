import {
  address,
  email,
  otpCode,
  regularPassword,
  v3password,
} from '@fixtures/identity/accounts';
import { document } from '@fixtures/identity/documents';
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

      cy.wait('@routeAuthCheck');

      cy.get('[data-test=email-input]').type(email);
      cy.get('[data-test=submit-button-auth]').click();

      cy.wait('@routeRegularPasswordCheck');

      cy.get('[data-test=password-input]').type(regularPassword);
      cy.get('[data-test=submit-button]').click();
      cy.get('[data-test=code-input]').type(otpCode);
      cy.mockAuthCheck(200);
      cy.get('[data-test=submit-button]').click();

      cy.wait('@routeLoginAuthToken');
      cy.wait('@routeAuthCheck');

      cy.get('[data-test=code-input]').type(otpCode);
      cy.mockAuthCheck(200);
      cy.mockOauthConsent(consentUrl);
      cy.get('[data-test=submit-button]').click();

      cy.wait('@routeAuthCheck');
      cy.wait('@routeMockOauthConsentGet');

      cy.get('[data-test=scopes-tree]').should('exist');
      cy.mockAuthCheck(401);
      cy.get('[data-test=submit-button]').click();

      cy.wait('@routeAuthCheck');

      cy.get('[data-test=submit-button-auth]').should('exist');
    });
  });

  describe('oauth login and get data', () => {
    beforeEach(() => {
      cy.visit(`${visitUrl}${visitBlockOauth}`, {
        onBeforeLoad(win) {
          cy.stub(win, 'open', args => {
            let search = '';
            const res = {
              closed: false,
              resizeTo() {},
              focus() {},
              location: {
                hash: '',
                search: '',
              },
            };
            Object.defineProperty(res.location, 'search', {
              get() {
                return search;
              },
            });
            Object.defineProperty(res.location, 'href', {
              set(newValue) {
                const state = newValue
                  .split('&')
                  .find(el => el.search('state=') === 0)
                  .split('=')[1];
                search = `state=${state}&code=code`;
              },
            });

            return res;
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

    it('should get list of documents', () => {
      cy.authFrameContinueRun();

      const buttonSelector = '[data-test=endpass-oauth-check-documents]';

      cy.get(buttonSelector).click();

      cy.window()
        .its('open')
        .should('be.called');

      cy.get('[data-test=endpass-app-loader]').should('not.exist');
      cy.authFrameWrapperHidden().should('exist');
      cy.get('[data-test=endpass-oauth-documents-list]')
        .eq(0)
        .should('contain.text', document.id);

      cy.get('[data-test=endpass-oauth-clear-token-button]').click();
      cy.get(buttonSelector).should('exist');
    });

    it('should upload document with empty document list', () => {
      cy.mockDocumentsList([]);
      cy.authFrameContinueRun();

      const buttonSelector = '[data-test=endpass-oauth-check-documents]';
      const dialogSelector = '[data-test=document-create-modal]';

      cy.get(buttonSelector).click();

      cy.window()
        .its('open')
        .should('be.called');

      cy.wait('@routeAuthCheck');

      cy.authFrameWrapperVisible().should('exist');
      cy.getElementFromAuth(dialogSelector).should(
        'contain.text',
        'Upload document',
      );

      cy.uploadFile(
        '#v-file-drop-area-idx-1',
        'identity/documents/driver-license.jpg',
        'image/jpg',
      );
      cy.getElementFromAuth(
        `${dialogSelector} [data-test=submit-button]`,
      ).click();

      cy.wait('@routeDocumentUploadCheck');

      cy.getElementFromAuth(dialogSelector).should(
        'contain.text',
        'Add back side',
      );
      cy.getElementFromAuth(
        `${dialogSelector} [data-test=modal-card-button-close]`,
      ).click();

      cy.get('[data-test=endpass-oauth-clear-token-button]').click();
      cy.get(buttonSelector).should('exist');
    });

    it('should clean token', () => {
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

      cy.get('[data-test=endpass-oauth-clear-token-button]').click();
      cy.get('[data-test=endpass-oauth-get-email-button]').should('exist');
    });
  });
});
