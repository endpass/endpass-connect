import { visitUrl } from '@config';

Cypress.Commands.add('waitPageLoad', () => {
  cy.server();
  cy.visit(visitUrl);
  cy.authFramePrepare();
  cy.mockInitialData();
});
