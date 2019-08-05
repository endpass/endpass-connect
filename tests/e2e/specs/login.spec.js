import { identityAPIUrl } from '../support/config';
import check403 from '../../fixtures/identity/auth/check-403';
import { address } from '../../fixtures/account/v3';

describe('login', function() {
  describe('connect login features', () => {
    beforeEach(() => {
      cy.visit('http://localhost:4444/#/basic');
      cy.wait(100);
      return cy.authBridgeStart().then(cy.clearMocks);
    });

    it.skip('should show apply password form', () => {
      cy.mockRoute({
        url: `${identityAPIUrl}/auth/check`,
        method: 'GET',
        status: 403,
        response: check403,
      });

      cy.wait(100);

      cy.authBridgeFinish().then(() => {
        cy.get('[data-test=endpass-app-loader]').should('exist');
        cy.getAuthFrame().should('exist');

        cy.getAuthFrame()
          .iframe('[data-test=sign-form]')
          .should('exist');
      });
    });

    it.skip('should cancel login on dialog close', () => {
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
      cy.wait(250);

      cy.mockLogin();

      cy.authBridgeFinish().then(() => {
        cy.get('[data-test=endpass-app-loader]').should('not.exist');
        cy.get('[data-endpass=wrapper][data-visible=false]').should('exist');
        cy.get('[data-test=endpass-form]')
          .get('.tag').eq(1)
          .should('contain.text', address);
      });
    });
  });
});
