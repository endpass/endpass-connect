import { identityAPIUrl } from '../support/config';

describe('login', function() {
  describe('connect login features', () => {
    beforeEach(() => {
      cy.visit('http://localhost:4444/#/basic');
      cy.wait(100);
    });

    afterEach(() => {
      // cy.clearMocks();
    });

    it('should login to system', () => {
      cy.startAuthBridge().then(() => {
        cy.mockRoute({
          url: `${identityAPIUrl}/auth/check`,
          method: 'GET',
          status: 401,
          response: {},
        });

        cy.get('[data-test=endpass-app-loader]').should('exist');
        cy.getAuthFrame().should('exist');

        cy.getAuthFrame()
          .iframe('[data-test=auth-form]')
          .should('exist');
      });
    });

    it.skip('should cancel login on dialog close', () => {
      cy.startAuthBridge().then(() => {
        cy.mockRouteOnce({
          url: 'https://identity-dev.endpass.com/api/v1.1/auth/check',
          method: 'GET',
          status: 401,
          response: {},
        });

        cy.get('[data-test=endpass-sign-in-button]').click();
        cy.get('[data-visible=true]');
        cy.get('[data-visible=true] iframe');
      });
    });
  });
});
