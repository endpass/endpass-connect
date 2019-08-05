import { identityAPIUrl } from '../support/config';
import accounts from '../../fixtures/identity/account/accounts';
import check403 from '../../fixtures/identity/auth/check-403';

describe('login', function() {
  describe('connect login features', () => {
    beforeEach(() => {
      cy.visit('http://localhost:4444/#/basic');
      cy.wait(100);
      return cy.authBridgeStart(cy.clearMocks);
    });

    it('should show apply password form', () => {
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

    it.skip('should login to system', () => {
      console.log('--- start mock requests');
      cy.mockLogin();

      cy.authBridgeFinish().then(() => {
        console.log('--- start tests here');
        cy.get('[data-test=endpass-app-loader]').should('exist');
        cy.getAuthFrame().should('exist');

        cy.getAuthFrame()
          .iframe('[data-test=sign-form]')
          .should('exist');
      });
    });
  });
});
