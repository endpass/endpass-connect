import { address } from '@fixtures/identity/addresses';
import { email } from '@fixtures/identity/user';
import { document, uploadedDocument, uploadedDocumentId, documentVerified } from '@fixtures/identity/documents';
import { authUrl } from '@config';

describe('requests', () => {
  beforeEach(() => {
    cy.waitPageLoad();

    cy.mockAuthCheck(200);
    cy.authFrameContinueRun();

    cy.mockOnceOauthState();
  });

  describe('user email', () => {
    it('should show user\'s email', () => {
      cy.get('[data-test=endpass-oauth-back-button]').should('not.exist');

      cy.get('[data-test=endpass-oauth-get-user-details-button] button').click();
      cy.wait('@routeAuthCheck');

      cy.authFrameWrapperHidden().should('exist');
      cy.get('[data-test=endpass-oauth-back-button]').should('exist');
      cy.get('[data-test=endpass-oauth-user-email]').should(
        'contain.text',
        email,
      );
    });
  });

  describe('user addresses', () => {
    it('should show list of addresses', () => {
      cy.get('[data-test=endpass-oauth-back-button]').should('not.exist');

      cy.get('[data-test=endpass-oauth-get-accounts-button] button').click();
      cy.wait('@routeAuthCheck');

      cy.authFrameWrapperHidden().should('exist');

      cy.get('[data-test=endpass-oauth-back-button]').should('exist');

      cy.get('[data-test=endpass-oauth-user-address]')
          .eq(0)
          .should('contain.text', address.id);
    });
  });

  describe('documents', () => {
    const consentUrl = `${authUrl}prepare.html?redirect=/public/consent&consent_challenge=consent_challenge`;

    const requiredDocumentsSelector = '.required-document-types-list';
    const passportSelector = `${requiredDocumentsSelector} .document-types-item:first`;
    const availableDocumentSelector = '.selected-document-types-list .document-types-item:first';

    it('should upload document', () => {
      cy.mockDocumentsList([]);
      cy.mockAuthCheck(403);
      cy.mockOauthConsent(consentUrl);

      cy.get('[data-test=endpass-oauth-get-documents-button] button').click();

      cy.authFrameWrapperVisible().should('exist');
      cy.getElementFromAuth(requiredDocumentsSelector).should('exist');

      cy.getElementFromAuth(passportSelector).should(
        'contain.text',
        'Not added yet',
      );

      cy.getElementFromAuth(passportSelector).click();

      cy.uploadFile(
        '#v-file-drop-area-idx-1',
        'identity/documents/driver-license.jpg',
        'image/jpg',
      );

      cy.mockDocumentsList([uploadedDocument]);
      cy.mockOnceOauthState();

      cy.getElementFromAuth('[data-test=submit-button]').should(
        'contain.text',
        'Confirm',
      );
      cy.getElementFromAuth('[data-test=submit-button]').click();
      
      cy.wait('@routeDocumentUploadCheck');
      cy.wait('@documentUpload');

      cy.getElementFromAuth(passportSelector).should(
        'contain.text',
        'Pending review',
      );

      cy.getElementFromAuth('[data-test=submit-button]').click();

      cy.getElementFromAuth('.pending-titles').should('exist');

      cy.wait(30000);

      cy.getElementFromAuth('.continue-titles').should('exist');
      cy.getElementFromAuth('.v-button').click();

      cy.get('[data-test=endpass-oauth-documents-list]').should(
        'contain.text',
        uploadedDocumentId,
      );
    });

    it('should select document from already uploaded and show list', () => {
      cy.mockDocumentsList([documentVerified]);
      cy.mockAuthCheck(403);
      cy.mockOauthConsent(consentUrl);

      cy.get('[data-test=endpass-oauth-get-documents-button] button').click();

      cy.authFrameWrapperVisible().should('exist');
      cy.getElementFromAuth(requiredDocumentsSelector).should('exist');

      cy.getElementFromAuth(passportSelector).should(
        'contain.text',
        'Not added yet',
      );
      cy.getElementFromAuth(passportSelector).click();

      cy.getElementFromAuth('#v-file-drop-area-idx-1').should('not.exist');

      cy.getElementFromAuth(availableDocumentSelector).should(
        'contain.text',
        'Verified',
      );
      cy.getElementFromAuth(availableDocumentSelector).click();

      cy.getElementFromAuth(passportSelector).should(
        'contain.text',
        'Verified',
      );

      cy.mockOnceOauthState();
      cy.getElementFromAuth('[data-test=submit-button]').click();

      cy.get('[data-test=endpass-oauth-documents-list]').should(
        'contain.text',
        documentVerified.id,
      );
    });

    it('should show upload form when user do not want to select already uploaded', () => {
      cy.mockDocumentsList([documentVerified]);
      cy.mockAuthCheck(403);
      cy.mockOauthConsent(consentUrl);

      cy.get('[data-test=endpass-oauth-get-documents-button] button').click();

      cy.authFrameWrapperVisible().should('exist');
      cy.getElementFromAuth(requiredDocumentsSelector).should('exist');

      cy.getElementFromAuth(passportSelector).should(
        'contain.text',
        'Not added yet',
      );
      cy.getElementFromAuth(passportSelector).click();

      cy.getElementFromAuth('[data-test=continue-button]').click();

      cy.getElementFromAuth('#v-file-drop-area-idx-1').should('exist');

      cy.getElementFromAuth('[data-test=cancel-button]').click();

      cy.getElementFromAuth('#v-file-drop-area-idx-1').should('not.exist');
    });
  });

  describe('controls', () => {
    beforeEach(() => {
      cy.get('[data-test=endpass-oauth-back-button]').should('not.exist');

      cy.get('[data-test=endpass-oauth-get-user-details-button] button').click();
      cy.wait('@routeAuthCheck');

      cy.authFrameWrapperHidden().should('exist');
      cy.get('[data-test=endpass-oauth-back-button]').should('exist');
    });

    it('should going back', () => {
      // We should force to avoid opened dialog upon (e2e bug)
      cy.get('[data-test=endpass-oauth-back-button]').click({
        force: true,
      });

      cy.get('[data-test=endpass-oauth-back-button]').should('not.exist');
    });

    it('should clear token', () => {
      // We should force to avoid opened dialog upon (e2e bug)
      cy.get('[data-test=endpass-oauth-clear-token-button]').click({
        force: true,
      });

      cy.get('[data-test=endpass-oauth-back-button]').should('not.exist');
    });
  });
});
