import { address } from '@fixtures/identity/accounts';

Cypress.Commands.add('shouldLoggedIn', () => {
  cy.wait('@balance', {
    timeout: 20000,
  });
  cy.get('[data-test=endpass-app-loader]', {
    timeout: 200000,
  }).should('not.exist');
  cy.authFrameWrapperHidden().should('exist');
  cy.getElementFromWidget('[data-test=widget-header]').should('exist');
  cy.get('[data-test=endpass-form-basic-active-account]').contains(address);
});

Cypress.Commands.add('shouldLogout', () => {
  cy.wait('@routeAuthLogout');
  cy.get('@e2eLogout').should('be.called');
});
