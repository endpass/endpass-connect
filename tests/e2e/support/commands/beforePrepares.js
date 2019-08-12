import { visitUrl } from '../config';

Cypress.Commands.add('beforePrepares', () => {
  cy.visit(visitUrl);
  cy.wait(100);
  return cy.authFramePrepare().then(cy.clearMocks);
});
