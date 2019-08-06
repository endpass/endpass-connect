import { identityAPIUrl } from '../support/config';
import { address } from '../../fixtures/identity/accounts';
import { responseSuccess } from '../../fixtures/response';

describe('login', function() {
  describe('connect login features', () => {
    beforeEach(() => {
      cy.visit('http://localhost:4444/#/basic');
      cy.wait(100);
      return cy.authBridgeStart().then(cy.clearMocks);
    });

    it('should show apply password form', () => {
      cy.mockRoute({
        url: `${identityAPIUrl}/auth/check`,
        method: 'GET',
        status: 403,
        response: {},
      });

      cy.authBridgeFinish().then(() => {
        cy.get('[data-test=endpass-app-loader]').should('exist');
        cy.getAuthFrame().should('exist');

        cy.getAuthFrame()
          .getIframeElement('[data-test=sign-form]')
          .should('exist');
      });
    });

    it('should cancel login on dialog close', () => {
      cy.mockRoute({
        url: `${identityAPIUrl}/auth/check`,
        method: 'GET',
        status: 401,
        response: {},
      });

      cy.authBridgeFinish().then(() => {
        cy.get('[data-test=endpass-app-loader]').should('exist');
        cy.getAuthFrame().should('exist');

        cy.getAuthFrame()
          .getIframeElement('.v-modal-card-close')
          .click();

        cy.authWrapperHidden().should('exist');
      });
    });

    it('should login to system', () => {
      cy.mockLogin();

      cy.authBridgeFinish().then(() => {
        cy.get('[data-test=endpass-app-loader]').should('not.exist');
        cy.authWrapperHidden().should('exist');
        cy.get('[data-test=endpass-form]')
          .get('.tag')
          .eq(1)
          .should('contain.text', address);
      });
    });

    it('should logout from system', () => {
      cy.mockLogin();
      cy.mockRoute({
        url: `${identityAPIUrl}/logout`,
        method: 'POST',
        status: 200,
        response: responseSuccess,
      });

      cy.authBridgeFinish().then(() => {
        cy.get('[data-test=endpass-app-loader]').should('not.exist');
        cy.get('[data-test=endpass-form-sign-out-button]').click();
        cy.get('[data-test=endpass-sign-in-button]').should('exist');
      });
    });
  });
});
