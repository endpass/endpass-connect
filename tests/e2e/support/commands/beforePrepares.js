import { visitUrl } from '../config';

Cypress.Commands.add('beforePrepares', () => {
  cy.visit(visitUrl);
  return cy.authFramePrepare();
});
