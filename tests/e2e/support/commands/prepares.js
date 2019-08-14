import { visitUrl, visitBlockBasic } from '@config';

Cypress.Commands.add('waitPageLoad', (block = visitBlockBasic) => {
  cy.server();
  cy.visit(`${visitUrl}${block}`);
  cy.authFramePrepare();
  cy.mockInitialData();
});
