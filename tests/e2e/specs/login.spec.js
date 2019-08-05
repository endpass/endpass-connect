import { identityAPIUrl } from '../support/config';
import check403 from '../../fixtures/identity/auth/check-403';
import { address } from '../../fixtures/identity/account/v3';
import success from '../../fixtures/identity/success';

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
        response: check403,
      });

      cy.authBridgeFinish().then(() => {
        cy.get('[data-test=endpass-app-loader]').should('exist');
        cy.getAuthFrame().should('exist');

        cy.getAuthFrame()
          .iframe('[data-test=sign-form]')
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
          .iframe('.v-modal-card-close')
          .click();

        cy.get('[data-endpass=wrapper][data-visible=false]').should('exist');
      });
    });

    it('should login to system', () => {
      cy.mockLogin();

      cy.authBridgeFinish().then(() => {
        cy.get('[data-test=endpass-app-loader]').should('not.exist');
        cy.get('[data-endpass=wrapper][data-visible=false]').should('exist');
        cy.get('[data-test=endpass-form]')
          .get('.tag').eq(1)
          .should('contain.text', address);
      });
    });

    it('should logout from system', () => {
      cy.mockLogin();
      cy.mockRoute({
        url: `${identityAPIUrl}/logout`,
        method: 'POST',
        status: 200,
        response: success,
      });

      cy.authBridgeFinish().then(() => {
        cy.get('[data-test=endpass-app-loader]').should('not.exist');
        cy.get('[data-test=endpass-form-sign-out-button]').click();
        cy.get('[data-test=endpass-sign-in-button]').should('exist');
      });
    });
  });
});
