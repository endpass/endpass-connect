import {
  address,
  email,
  otpCode,
  regularPassword,
} from '@fixtures/identity/accounts';
import { document } from '@fixtures/identity/documents';
import { authUrl, visitUrl, visitBlockOauth } from '@config';

describe('oauth', () => {
  describe('oauth popup window', () => {
    beforeEach(() => {
      cy.server();
      cy.mockAuthCheck(401);
    });

    it('should login by oauth flow', () => {
      cy.mockInitialData();
      cy.mockAuthCheck(401);
      const loginUrl = `${authUrl}prepare.html?redirect=/public/login&login_challenge=login_challenge`;
      const consentUrl = `${authUrl}prepare.html?redirect=/public/consent&consent_challenge=consent_challenge`;

      cy.visit(loginUrl);

      cy.mockAuthLogin('otp', loginUrl);

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
      cy.visit(`${visitUrl}${visitBlockOauth}`);
      cy.preparePage();
    });

    it('should show accounts list', () => {
      cy.authFrameContinueRun();
      cy.mockOnceOauthState();

      cy.get('[data-test=endpass-oauth-get-accounts-button] button').click();

      cy.get('[data-test=endpass-app-loader]').should('not.exist');
      cy.authFrameWrapperHidden().should('exist');
      cy.get('[data-test=endpass-oauth-accounts-list]')
        .eq(0)
        .should('contain.text', address);
    });

    it('should show account email', () => {
      cy.authFrameContinueRun();
      cy.mockOnceOauthState();

      cy.get('[data-test=endpass-oauth-get-email-button] button').click();

      cy.get('[data-test=endpass-app-loader]').should('not.exist');
      cy.authFrameWrapperHidden().should('exist');
      cy.get('[data-test=endpass-oauth-user-email]').should(
        'contain.text',
        email,
      );
    });

    it.skip('should get list of documents', () => {
      cy.authFrameContinueRun();
      cy.mockOnceOauthState();

      const buttonSelector = '[data-test=endpass-oauth-get-documents] button';

      cy.get(buttonSelector).click();

      cy.get('[data-test=endpass-app-loader]').should('not.exist');
      cy.authFrameWrapperHidden().should('exist');
      cy.get('[data-test=endpass-oauth-documents-list]')
        .eq(0)
        .should('contain.text', document.id);

      cy.get('[data-test=endpass-oauth-clear-token-button]').click();
      cy.get(buttonSelector).should('exist');
    });

    it.skip('should upload document with empty document list', () => {
      cy.mockDocumentsList([]);
      cy.authFrameContinueRun();
      cy.mockOnceOauthState();

      const buttonSelector = '[data-test=endpass-oauth-get-documents] button';
      const dialogSelector = '[data-test=document-create-modal]';

      cy.get(buttonSelector).click();

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

      cy.mockDocumentsList();
      cy.mockOnceOauthState();

      cy.getElementFromAuth(
        `${dialogSelector} [data-test=submit-button]`,
      ).click();

      cy.wait('@routeDocumentUploadCheck');

      cy.get('[data-test=endpass-oauth-documents-list]').should('exist');

      cy.get('[data-test=endpass-oauth-clear-token-button]').click();
      cy.get(buttonSelector).should('exist');
    });

    it('should clean token', () => {
      cy.authFrameContinueRun();
      cy.mockOnceOauthState();

      cy.get('[data-test=endpass-oauth-get-email-button] button').click();

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
